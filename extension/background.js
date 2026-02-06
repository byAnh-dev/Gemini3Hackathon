async function postIngest(payload) {
  const res = await fetch("http://localhost:8080/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "SYNC_NOW") return;

  (async () => {
    // find active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.startsWith("https://canvas.ku.edu/")) {
      sendResponse({ ok: false, error: "Open canvas.ku.edu first." });
      return;
    }

    // ask content script to scrape
    const scan = await chrome.tabs.sendMessage(tab.id, { type: "SCAN_COURSES" });
    const payload = {
      source: "canvas.ku.edu",
      capturedAt: new Date().toISOString(),
      courses: scan.courses || [],
    };

    const out = await postIngest(payload);
    sendResponse({ ok: true, backend: out, courseCount: payload.courses.length });
  })().catch((e) => sendResponse({ ok: false, error: String(e.message || e) }));

  return true; // keep channel open for async
});

