// Runs on https://ku.simplesyllabus.com/* (including inside iframes via all_frames:true)
// Extracts visible syllabus text and reports back to background.

(function () {
  // Safety: only run on Simple Syllabus pages
  // (important because fallback injection targets all frames in a tab)
  if (!location.hostname.includes("simplesyllabus.com")) return;

  const CAP = 20000;

  function getText() {
    // Try specific content containers first, fall back to body
    const content =
      document.querySelector(".syllabus-content") ||
      document.querySelector('[class*="syllabus"]') ||
      document.querySelector("main") ||
      document.querySelector("#content") ||
      document.querySelector(".content") ||
      document.body;

    const t = (content?.innerText || "").trim();
    return t.replace(/\n{3,}/g, "\n\n").slice(0, CAP);
  }

  async function waitForContent() {
    // Simple Syllabus pages often hydrate client-side; poll until text appears
    for (let i = 0; i < 30; i++) {
      const text = getText();

      // Lower threshold (200) so we don't miss shorter syllabi
      if (text.length > 200 && !text.toLowerCase().includes("loading")) {
        return text;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return getText(); // best-effort after 15 s
  }

  (async () => {
    const text = await waitForContent();
    console.log(
      "[provider_content.js] Captured",
      text.length,
      "chars from",
      location.href
    );
    chrome.runtime.sendMessage({
      type: "SYLLABUS_CAPTURED",
      url: location.href,
      text,
    });
  })();
})();
