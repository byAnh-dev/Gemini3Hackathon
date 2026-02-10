// background.js (MV3 service worker)
//
// Covers:
// - Pairing flow (CONNECT): /pair/request -> open WEBSITE_URL -> poll /pair/status -> save deviceToken
// - Sync flow (SYNC_NOW): ensure content.js -> SCAN_COURSES -> capture syllabus per course via hidden tab
// - Ingest: POST /ingest with deviceToken + courses enriched with syllabusText
// - Provider callback: provider_content.js sends SYLLABUS_CAPTURED -> resolves pending capture and closes tab

const BACKEND_BASE = "http://localhost:8080";
const WEBSITE_URL = "http://localhost:3000";
const SIMPLE_SYLLABUS_TOOL_ID = 2240; // fallback only; dynamic discovery preferred

// ---------------------------
// Small utilities
// ---------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sendTabMessage(tabId, msg) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, msg, (resp) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(resp);
    });
  });
}

function runtimeSendResponseSafe(sendResponse, payload) {
  try {
    sendResponse(payload);
  } catch {
    // ignore (channel already closed)
  }
}

function execScript(tabId, func, args = []) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      { target: { tabId }, func, args },
      (res) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(res?.[0]?.result);
      }
    );
  });
}

function createTab(url, active = false) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url, active }, (tab) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else if (!tab?.id) reject(new Error("Failed to create tab"));
      else resolve(tab);
    });
  });
}

function removeTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.remove(tabId, () => resolve());
  });
}

function waitForTabComplete(tabId, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId) return;
      if (changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    const tick = () => {
      if (Date.now() - start > timeoutMs) {
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error("Tab load timeout"));
      } else {
        setTimeout(tick, 250);
      }
    };
    tick();
  });
}

// ---------------------------
// Pairing + deviceToken storage
// ---------------------------
async function startPairRequest() {
  const res = await fetch(`${BACKEND_BASE}/pair/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "pair/request failed");
  if (!data.pairCode) throw new Error("pairCode missing in response");
  return data.pairCode;
}

async function pollPairStatus(pairCode) {
  const res = await fetch(`${BACKEND_BASE}/pair/status?code=${encodeURIComponent(pairCode)}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "pair/status failed");
  return data; // { ok, status, deviceToken, ... }
}

function saveDeviceToken(deviceToken) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ deviceToken }, () => resolve());
  });
}

function getDeviceToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["deviceToken"], (res) => resolve(res.deviceToken || null));
  });
}

// ---------------------------
// Ingest
// ---------------------------
async function postIngest(payload) {
  const res = await fetch(`${BACKEND_BASE}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}

// ---------------------------
// Ensure content.js exists (bulletproof injection)
// ---------------------------
async function ensureContentScript(tabId) {
  try {
    await sendTabMessage(tabId, { type: "PING" });
    return;
  } catch {
    // Inject content.js on-demand
    await new Promise((resolve, reject) => {
      chrome.scripting.executeScript(
        { target: { tabId }, files: ["content.js"] },
        () => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve();
        }
      );
    });
    // Verify
    await sendTabMessage(tabId, { type: "PING" });
  }
}

// ---------------------------
// Simple Syllabus capture
//
// Strategy:
//   1. Open a hidden tab to the Canvas external_tools launch URL.
//   2. Canvas renders a page with an LTI form and an iframe, then
//      auto-submits the form into the iframe.
//   3. The iframe navigates to ku.simplesyllabus.com.
//   4. provider_content.js (with all_frames:true in manifest) runs
//      inside that iframe, extracts text, and sends SYLLABUS_CAPTURED.
//   5. We resolve the pending promise and close the tab.
//
// Fallbacks:
//   - After 3 s: programmatically inject provider_content.js into
//     all frames (in case the manifest-declared injection missed).
//   - After 8 s more: manually submit the LTI form with target=_self
//     so the tab itself navigates to Simple Syllabus (last resort).
// ---------------------------

// tabId -> { resolve, reject, courseId, timer }
const pendingSyllabus = new Map();

async function captureSyllabusForCourse(courseId, launchUrl, timeoutMs = 45000) {
  // Use dynamically-discovered URL if available, else hardcoded fallback
  const url =
    launchUrl ||
    `https://canvas.ku.edu/courses/${courseId}/external_tools/${SIMPLE_SYLLABUS_TOOL_ID}`;

  console.log("[CAPTURE_START]", "courseId=", courseId, "url=", url);

  const tab = await createTab(url, false);
  const tabId = tab.id;

  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(async () => {
      pendingSyllabus.delete(tabId);
      await removeTab(tabId).catch(() => {});
      reject(new Error("Timed out capturing syllabus"));
    }, timeoutMs);

    pendingSyllabus.set(tabId, { resolve, reject, courseId, timer });

    try {
      // 1. Wait for the Canvas LTI launch page to finish loading.
      //    Canvas auto-submits the LTI form into an iframe; the iframe
      //    then navigates to ku.simplesyllabus.com.
      await waitForTabComplete(tabId, 15000);

      // 2. Give the iframe time to load after the main page completes.
      await sleep(3000);

      // 3. Fallback: if provider_content.js hasn't fired yet (manifest
      //    injection didn't run), programmatically inject into all frames.
      if (pendingSyllabus.has(tabId)) {
        console.log("[FALLBACK_INJECT]", "tabId=", tabId);
        try {
          await chrome.scripting.executeScript({
            target: { tabId, allFrames: true },
            files: ["provider_content.js"],
          });
        } catch (e) {
          console.warn("[FALLBACK_INJECT] failed:", e.message);
        }
      }

      // 4. Wait a bit more for the fallback injection to report back.
      await sleep(5000);

      // 5. Last resort: if still pending, try submitting the LTI form
      //    manually with target="_self" so the tab navigates directly
      //    to Simple Syllabus (away from the Canvas wrapper).
      if (pendingSyllabus.has(tabId)) {
        console.log("[LAST_RESORT_SUBMIT]", "tabId=", tabId);
        try {
          await execScript(tabId, () => {
            // Case-insensitive search for any form that posts to simplesyllabus
            const forms = document.querySelectorAll("form");
            for (const form of forms) {
              const action = form.getAttribute("action") || "";
              const method = (form.getAttribute("method") || "").toUpperCase();
              if (action.includes("simplesyllabus") && method === "POST") {
                form.target = "_self";
                form.submit();
                return { ok: true };
              }
            }
            return { ok: false, error: "No Simple Syllabus form found" };
          });

          // After form submission, the tab navigates to Simple Syllabus.
          // Wait for it to load and for provider_content.js to run.
          await waitForTabComplete(tabId, 15000).catch(() => {});
          await sleep(2000);

          // Try injecting again after navigation
          if (pendingSyllabus.has(tabId)) {
            try {
              await chrome.scripting.executeScript({
                target: { tabId, allFrames: true },
                files: ["provider_content.js"],
              });
            } catch (e) {
              console.warn("[LAST_RESORT_INJECT] failed:", e.message);
            }
          }
        } catch (e) {
          console.warn("[LAST_RESORT_SUBMIT] failed:", e.message);
        }
      }

      // The promise will be resolved by handleSyllabusCaptured() when
      // provider_content.js sends SYLLABUS_CAPTURED, or rejected by
      // the timeout timer above.
    } catch (e) {
      // Only reject if not already resolved
      if (pendingSyllabus.has(tabId)) {
        clearTimeout(timer);
        pendingSyllabus.delete(tabId);
        await removeTab(tabId).catch(() => {});
        reject(e);
      }
    }
  });
}

// provider_content.js callback
function handleSyllabusCaptured(msg, sender) {
  const tabId = sender?.tab?.id;
  if (!tabId) return;

  const pending = pendingSyllabus.get(tabId);
  if (!pending) return;

  console.log(
    "[SYLLABUS_CAPTURED]",
    "courseId=", pending.courseId,
    "url=", msg.url,
    "chars=", (msg.text || "").length
  );

  clearTimeout(pending.timer);
  pendingSyllabus.delete(tabId);

  // close hidden tab (best-effort)
  chrome.tabs.remove(tabId);

  const text = (msg.text || "").slice(0, 20000);

  pending.resolve({
    courseId: pending.courseId,
    syllabusProviderUrl: msg.url || null,
    syllabusText: text
  });
}
// ---------------------------
// Main message router
// ---------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // 1) Provider -> background (no sendResponse)
  if (msg?.type === "SYLLABUS_CAPTURED") {
    handleSyllabusCaptured(msg, sender);
    return; // no async response channel needed
  }

  // 2) CONNECT
  if (msg?.type === "CONNECT") {
    (async () => {
      const pairCode = await startPairRequest();
      await createTab(`${WEBSITE_URL}/pair?code=${encodeURIComponent(pairCode)}`, true);

      const timeoutMs = 120000;
      const start = Date.now();

      while (Date.now() - start < timeoutMs) {
        const st = await pollPairStatus(pairCode);
        if (st.status === "PAIRED" && st.deviceToken) {
          await saveDeviceToken(st.deviceToken);
          runtimeSendResponseSafe(sendResponse, { ok: true, deviceToken: st.deviceToken });
          return;
        }
        await sleep(1000);
      }

      throw new Error("Timed out waiting for pairing");
    })().catch((e) => {
      runtimeSendResponseSafe(sendResponse, { ok: false, error: e?.message || String(e) });
    });

    return true; // keep sendResponse alive
  }

  // 3) SYNC_NOW
  if (msg?.type === "SYNC_NOW") {
    (async () => {
      const deviceToken = await getDeviceToken();
      if (!deviceToken) {
        runtimeSendResponseSafe(sendResponse, { ok: false, error: "Not paired yet. Click Connect first." });
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url?.startsWith("https://canvas.ku.edu/")) {
        runtimeSendResponseSafe(sendResponse, { ok: false, error: "Open https://canvas.ku.edu first." });
        return;
      }

      await ensureContentScript(tab.id);

      // SCAN_COURSES now returns courses with dynamically-discovered syllabusUrl
      const scan = await sendTabMessage(tab.id, { type: "SCAN_COURSES" });
      if (!scan?.ok) throw new Error(scan?.error || "SCAN_COURSES failed");

      const courses = Array.isArray(scan.courses) ? scan.courses : [];
      const enrichedCourses = [];

      for (const c of courses) {
        const courseId = c.canvasCourseId || c.courseId || c.id;
        if (!courseId) {
          enrichedCourses.push({
            ...c,
            syllabusUrl: null,
            syllabusProviderUrl: null,
            syllabusText: "",
            syllabusFetchError: "Missing canvasCourseId"
          });
          continue;
        }

        try {
          // Use the syllabusUrl discovered by content.js (Canvas tabs API / nav parsing)
          const out = await captureSyllabusForCourse(courseId, c.syllabusUrl);

          console.log("[CAPTURE_OK]", courseId, "chars=", (out.syllabusText || "").length, "url=", out.syllabusProviderUrl);

          enrichedCourses.push({
            ...c,
            canvasCourseId: courseId,
            syllabusUrl: c.syllabusUrl || `https://canvas.ku.edu/courses/${courseId}/external_tools/${SIMPLE_SYLLABUS_TOOL_ID}`,
            syllabusProviderUrl: out.syllabusProviderUrl,
            syllabusText: out.syllabusText
          });
        } catch (e) {
          console.warn("[CAPTURE_FAIL]", courseId, e?.message || String(e));
          enrichedCourses.push({
            ...c,
            canvasCourseId: courseId,
            syllabusUrl: c.syllabusUrl || `https://canvas.ku.edu/courses/${courseId}/external_tools/${SIMPLE_SYLLABUS_TOOL_ID}`,
            syllabusProviderUrl: null,
            syllabusText: "",
            syllabusFetchError: e?.message || String(e)
          });
        }
      }

      const payload = {
        deviceToken,
        source: "canvas.ku.edu",
        capturedAt: new Date().toISOString(),
        courses: enrichedCourses
      };

      console.log("[INGEST_POST]", "courses=", enrichedCourses.length, "sampleChars=", enrichedCourses[0]?.syllabusText?.length);

      const out = await postIngest(payload);

      // Optional: return a tiny preview so popup can show something
      runtimeSendResponseSafe(sendResponse, {
        ok: true,
        backend: out,
        courseCount: enrichedCourses.length,
        preview: enrichedCourses.map(x => ({
          courseId: x.canvasCourseId,
          chars: (x.syllabusText || "").length,
          url: x.syllabusProviderUrl
        }))
      });
    })().catch((e) => {
      runtimeSendResponseSafe(sendResponse, { ok: false, error: e?.message || String(e) });
    });

    return true; // keep sendResponse alive
  }

  // Unknown message type
});
