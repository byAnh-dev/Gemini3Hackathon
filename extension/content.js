// Runs on canvas.ku.edu pages
console.log("[0Effort] content script loaded:", location.href);

function scanCourses() {
  // Try common Canvas dashboard card selector
  const cards = Array.from(document.querySelectorAll('a.ic-DashboardCard__link'));

  // Fallback: any anchor that looks like /courses/<id>
  const fallback = Array.from(document.querySelectorAll('a[href*="/courses/"]'));

  const links = (cards.length ? cards : fallback)
    .map(a => ({
      name: (a.getAttribute("aria-label") || a.textContent || "").trim(),
      url: a.href
    }))
    .filter(x => x.url.includes("/courses/"))
    .slice(0, 30); // cap for now

  return links;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "SCAN_COURSES") {
    const courses = scanCourses();
    sendResponse({ ok: true, count: courses.length, courses });
  }
  // keep it sync for now (no async work)
});
