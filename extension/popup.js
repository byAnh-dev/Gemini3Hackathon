const statusEl = document.getElementById("status");
const scanBtn = document.getElementById("scanBtn");
const syncBtn = document.getElementById("syncBtn");

function setStatus(msg) {
  statusEl.textContent = msg;
}

scanBtn.addEventListener("click", async () => {
  setStatus("Scanning...");

  // Find the currently active tab (should be canvas.ku.edu)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.url?.startsWith("https://canvas.ku.edu/")) {
    setStatus("Please open https://canvas.ku.edu first.");
    return;
  }

  // Send message to content script running in that tab
  chrome.tabs.sendMessage(
    tab.id,
    { type: "SCAN_COURSES" },
    (response) => {
      // Handle cases where content script isn't available
      if (chrome.runtime.lastError) {
        setStatus("Could not reach page script. Refresh Canvas and try again.");
        return;
      }

      if (!response?.ok) {
        setStatus("Scan failed.");
        return;
      }

      setStatus(`Found ${response.count} courses.`);
      console.log("Courses:", response.courses);
    }
  );
});

//Sync button to connect to backend
syncBtn.addEventListener("click", () => {
	setStatus("Sending to backend...");

	chrome.runtime.sendMessage({ type: "SYNC_NOW" }, (resp) => {
		if (chrome.runtime.lastError) {
			setStatus("Background error. Reload extension");
			return;
		}
		if (!resp?.ok) {
			setStatus(`Sync failed: ${resp?.error || "unknown"}`);
			return;
		}
		setStatus(`Synced ${resp.courseCount} courses`);
		console.log("Backend response:", resp.backend);
	});
});

