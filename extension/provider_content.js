// Runs on https://ku.simplesyllabus.com/*
// Extracts visible syllabus text and reports back to background.

(function () {
  const CAP = 20000;

  function getText() {
    const t = (document.body?.innerText || "").trim();
    return t.replace(/\n{3,}/g, "\n\n").slice(0, CAP);
  }

  async function waitForContent() {
    // Wait until the page actually renders content (SimpleSyllabus often hydrates)
    for (let i = 0; i < 30; i++) {
      const text = getText();

      // Heuristic: syllabus pages usually have a lot of text
      if (text.length > 800 && !text.toLowerCase().includes("loading")) {
        return text;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return getText(); // best-effort
  }

  (async () => {
    const text = await waitForContent();
    chrome.runtime.sendMessage({
      type: "SYLLABUS_CAPTURED",
      url: location.href,
      text
    });
  })();
})();
