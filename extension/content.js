const SYLLABUS_TEXT_CAP = 20000;     // cap text to reduce payload size
const FETCH_CONCURRENCY = 3;         // don’t fetch 10 syllabi at once

function parseCourseIdFromHref(href) {
  // expects something like: https://canvas.ku.edu/courses/12345
  const m = href.match(/\/courses\/(\d+)/);
  return m ? m[1] : null;
}

function absoluteUrl(url) {
  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

async function fetchHtml(url) {
  // include cookies so Canvas returns the real page
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // remove noisy elements
  doc.querySelectorAll("script, style, noscript").forEach((n) => n.remove());

  // Canvas usually renders main content in one of these
  const main =
    doc.querySelector("#content") ||
    doc.querySelector(".ic-app-main-content") ||
    doc.querySelector(".ic-Layout-contentMain") ||
    doc.body;

  const text = (main?.innerText || "").replace(/\n{3,}/g, "\n\n").trim();
  return text.slice(0, SYLLABUS_TEXT_CAP);
}

function getCoursesFromDashboard() {
  // We want links that look like /courses/12345
  // Canvas dashboard often has course cards with anchors.
  const anchors = Array.from(document.querySelectorAll('a[href*="/courses/"]'));

  const seen = new Set();
  const courses = [];

  for (const a of anchors) {
    const href = a.getAttribute("href");
    if (!href) continue;

    const full = absoluteUrl(href);
    const courseId = parseCourseIdFromHref(full);
    if (!courseId) continue;

    // Avoid duplicates
    if (seen.has(courseId)) continue;
    seen.add(courseId);

    // Best-effort name: anchor text or nearest card title
    const name =
      (a.textContent || "").trim() ||
      (a.closest(".ic-DashboardCard")?.querySelector(".ic-DashboardCard__header-title")?.textContent || "").trim() ||
      `Course ${courseId}`;

    courses.push({
      canvasCourseId: courseId,
      name,
      courseUrl: `https://canvas.ku.edu/courses/${courseId}`
    });
  }

  return courses;
}

async function enrichCourseWithSyllabus(course) {
  const syllabusUrl = `https://canvas.ku.edu/courses/${course.canvasCourseId}/syllabus`;

  let syllabusText = "";
  try {
    const html = await fetchHtml(syllabusUrl);
    syllabusText = htmlToText(html);

    // If Canvas returns a page but it’s basically empty, keep it empty (best-effort)
    if (!syllabusText || syllabusText.length < 50) {
      syllabusText = "";
    }
  } catch (e) {
    syllabusText = "";
  }

  return {
    ...course,
    syllabusUrl,
    syllabusText
  };
}

// Simple concurrency limiter
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;

  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "SCAN_COURSES") return;

  (async () => {
    // 1) discover courses
    const courses = getCoursesFromDashboard();

    // 2) add syllabusUrl + syllabusText (best-effort)
    const enriched = await mapWithConcurrency(
      courses,
      FETCH_CONCURRENCY,
      enrichCourseWithSyllabus
    );

    sendResponse({ ok: true, count: enriched.length, courses: enriched });
  })().catch((e) => {
    sendResponse({ ok: false, error: String(e?.message || e) });
  });

  return true; // important: keep message channel open for async
});
