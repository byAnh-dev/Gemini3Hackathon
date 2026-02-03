const statusEl = document.getElementById("status");
const scanBtn = document.getElementById("scanBtn");

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

