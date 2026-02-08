// background.js (MV3 service worker)
//
// Covers:
// - Pairing flow (CONNECT): /pair/request -> open WEBSITE_URL -> poll /pair/status -> save deviceToken
// - Sync flow (SYNC_NOW): ensure content.js -> SCAN_COURSES -> capture syllabus per course via hidden tab + LTI form submit
// - Ingest: POST /ingest with deviceToken + courses enriched with syllabusText
// - Provider callback: provider_content.js sends SYLLABUS_CAPTURED -> resolves pending capture and closes tab

const BACKEND_BASE = "http://localhost:8080";
const WEBSITE_URL = "http://localhost:3000";
const SIMPLE_SYLLABUS_TOOL_ID = 2240;

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
// Simple Syllabus capture (Canvas LTI launcher -> ku.simplesyllabus.com)
// ---------------------------

// tabId -> { resolve, reject, courseId, timer }
const pendingSyllabus = new Map();

async function submitSimpleSyllabusForm(tabId) {
  // Your HTML shows:
  // <form action="https://ku.simplesyllabus.com/ui/lti-login" method="POST" target="tool_content_841" ...>
  // We force navigation in the tab so provider_content.js can run on ku.simplesyllabus.com
  const result = await execScript(tabId, () => {
    const form = document.querySelector('form[action^="https://ku.simplesyllabus.com/"][method="POST"]');
    if (!form) return { ok: false, error: "Simple Syllabus LTI form not found on page" };

    form.target = "_self"; // override iframe target
    form.submit();
    return { ok: true };
  });

  if (!result?.ok) throw new Error(result?.error || "Failed to submit LTI form");
}

async function captureSyllabusForCourse(courseId, timeoutMs = 45000) {
  const launchUrl =
    `https://canvas.ku.edu/courses/${courseId}/external_tools/${SIMPLE_SYLLABUS_TOOL_ID}?display=borderless`;

  const tab = await createTab(launchUrl, false);
  const tabId = tab.id;

  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(async () => {
      pendingSyllabus.delete(tabId);
      await removeTab(tabId);
      reject(new Error("Timed out capturing syllabus"));
    }, timeoutMs);

    pendingSyllabus.set(tabId, { resolve, reject, courseId, timer });

    try {
      await waitForTabComplete(tabId, 15000);
      await submitSimpleSyllabusForm(tabId);
      // After submit: tab navigates to ku.simplesyllabus.com
      // provider_content.js will send SYLLABUS_CAPTURED to background
    } catch (e) {
      clearTimeout(timer);
      pendingSyllabus.delete(tabId);
      await removeTab(tabId);
      reject(e);
    }
  });
}

// provider_content.js callback
function handleSyllabusCaptured(msg, sender) {
  const tabId = sender?.tab?.id;
  if (!tabId) return;

  const pending = pendingSyllabus.get(tabId);
  if (!pending) return;

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
  // Provider -> background (no sendResponse needed)
  if (msg?.type === "SYLLABUS_CAPTURED") {
    handleSyllabusCaptured(msg, sender);
    return;
  }

  // CONNECT: pairing flow
  if (msg?.type === "CONNECT") {
    (async () => {
      const pairCode = await startPairRequest();

      // Open a pairing page for the user.
      // Adjust the path to whatever your frontend uses:
      // - If you built a page like /pair?code=... use this
      // - If you use a backend "confirm-dev" page, change WEBSITE_URL to BACKEND_BASE and the route accordingly
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

    return true; // keep channel open
  }

  // SYNC_NOW: requires deviceToken, scrapes courses, captures syllabus for each course, sends to /ingest
  if (msg?.type === "SYNC_NOW") {
    (async () => {
      const deviceToken = await getDeviceToken();
      if (!deviceToken) {
        runtimeSendResponseSafe(sendResponse, { ok: false, error: "Not paired yet. Click Connect first." });
        return;
      }

      // find active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url?.startsWith("https://canvas.ku.edu/")) {
        runtimeSendResponseSafe(sendResponse, { ok: false, error: "Open https://canvas.ku.edu first." });
        return;
      }

      // make sure content.js exists
      await ensureContentScript(tab.id);

      // scrape course list from content.js
      const scan = await sendTabMessage(tab.id, { type: "SCAN_COURSES" });
      if (!scan?.ok) throw new Error(scan?.error || "SCAN_COURSES failed");

      const courses = Array.isArray(scan.courses) ? scan.courses : [];
      const enrichedCourses = [];

      // Capture syllabus for each course (sequential: simplest + safest)
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
          const out = await captureSyllabusForCourse(courseId);
          enrichedCourses.push({
            ...c,
            canvasCourseId: courseId,
            syllabusUrl: `https://canvas.ku.edu/courses/${courseId}/external_tools/${SIMPLE_SYLLABUS_TOOL_ID}`,
            syllabusProviderUrl: out.syllabusProviderUrl,
            syllabusText: out.syllabusText
          });
        } catch (e) {
          enrichedCourses.push({
            ...c,
            canvasCourseId: courseId,
            syllabusUrl: `https://canvas.ku.edu/courses/${courseId}/external_tools/${SIMPLE_SYLLABUS_TOOL_ID}`,
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

      const out = await postIngest(payload);

      runtimeSendResponseSafe(sendResponse, {
        ok: true,
        backend: out,
        courseCount: enrichedCourses.length
      });
    })().catch((e) => {
      runtimeSendResponseSafe(sendResponse, { ok: false, error: e?.message || String(e) });
    });

    return true; // keep channel open
  }

  // Unknown message type: ignore
});

