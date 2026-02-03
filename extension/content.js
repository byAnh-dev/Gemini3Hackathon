// Runs on canvas.ku.edu pages
console.log("[0Effort] content script loaded:", location.href);

function extractCourseId(url) {
  // matches .../courses/12345 or .../courses/12345/...
  const m = url.match(/\/courses\/(\d+)/);
  return m ? m[1] : null;
}

function scanCourses() {
  // Canvas dashboard course cards usually have this anchor
  const cardLinks = Array.from(document.querySelectorAll("a.ic-DashboardCard__link"));

  const candidates = cardLinks.length
    ? cardLinks
    : Array.from(document.querySelectorAll('a[href*="/courses/"]'));

  const courses = candidates
    .map((a) => {
      const url = a.href;
      const courseId = extractCourseId(url);
      if (!courseId) return null;

      // Try to get a clean name
      const name =
        a.getAttribute("aria-label")?.trim() ||
        a.querySelector(".ic-DashboardCard__header-title")?.textContent?.trim() ||
        a.textContent?.trim() ||
        `Course ${courseId}`;

      return { courseId, name, url };
    })
    .filter(Boolean);

  // Deduplicate by courseId
  const dedup = [];
  const seen = new Set();
  for (const c of courses) {
    if (!seen.has(c.courseId)) {
      seen.add(c.courseId);
      dedup.push(c);
    }
  }

  return dedup.slice(0, 30);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "SCAN_COURSES") {
    const courses = scanCourses();
    sendResponse({ ok: true, count: courses.length, courses });
  }
  // keep it sync for now (no async work)
});
