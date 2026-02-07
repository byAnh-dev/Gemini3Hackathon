const BACKEND_BASE = "http://localhost:8080";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function startPairRequest() {
  const res = await fetch(`${BACKEND_BASE}/pair/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "pair/request failed");
  if (!data.pairCode) throw new Error("pairCode missing in response");
  return data.pairCode;
}

async function pollPairStatus(pairCode) {
  const res = await fetch(
    `${BACKEND_BASE}/pair/status?code=${encodeURIComponent(pairCode)}`
  );

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "pair/status failed");
  return data; // { ok, status, deviceToken, ... }
}


async function postIngest(payload) {
  const res = await fetch("http://localhost:8080/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // ----- CONNECT -----
  if (msg?.type === "CONNECT") {
    (async () => {
      const pairCode = await startPairRequest();

      // open your placeholder pairing page
      await chrome.tabs.create({
        url: `${BACKEND_BASE}/pair.html?code=${encodeURIComponent(pairCode)}`
      });

      const timeoutMs = 120000;
      const start = Date.now();

      while (Date.now() - start < timeoutMs) {
        const st = await pollPairStatus(pairCode);

        if (st.status === "PAIRED" && st.deviceToken) {
          await saveDeviceToken(st.deviceToken);
          sendResponse({ ok: true });
          return;
        }

        await sleep(1000);
      }

      throw new Error("Timed out waiting for pairing");
    })().catch((e) => sendResponse({ ok: false, error: e.message || String(e) }));

    return true;
  }

  // ----- SYNC_NOW -----
  if (msg?.type === "SYNC_NOW") {
    (async () => {
      const deviceToken = await getDeviceToken();
      if (!deviceToken) {
        sendResponse({ ok: false, error: "Not paired yet. Click Connect first." });
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url?.startsWith("https://canvas.ku.edu/")) {
        sendResponse({ ok: false, error: "Open canvas.ku.edu first." });
        return;
      }

      const scan = await chrome.tabs.sendMessage(tab.id, { type: "SCAN_COURSES" });

      const payload = {
        deviceToken,                   // ✅ now attached
        source: "canvas.ku.edu",
        capturedAt: new Date().toISOString(),
        courses: scan?.courses || [],
      };

      const out = await postIngest(payload);
      sendResponse({ ok: true, backend: out, courseCount: payload.courses.length });
    })().catch((e) => sendResponse({ ok: false, error: e.message || String(e) }));

    return true;
  }

  return false;
});

//Helper function to get and save device token
function saveDeviceToken(deviceToken){
	return new Promise((resolve)=> {
		chrome.storage.local.set({deviceToken}, ()=> resolve());
	});
}

function getDeviceToken(){
	return new Promise((resolve) => {
	chrome.storage.local.get(["deviceToken"], (res) => resolve(res.deviceToken || null));
	});
}

