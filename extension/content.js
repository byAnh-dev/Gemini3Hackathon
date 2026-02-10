console.log("0Effort content.js loaded on:", location.href);

const FETCH_CONCURRENCY = 3;      // don't spam requests

// -------------------------------
// Utilities
// -------------------------------
function absoluteUrl(url) {
  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

function parseCourseIdFromHref(href) {
  // match /courses/12345 or /courses/12345/
  const m = href.match(/\/courses\/(\d+)(\/|$)/);
  return m ? m[1] : null;
}

function normalizeCourseHome(courseId) {
  return `https://canvas.ku.edu/courses/${courseId}`;
}

async function fetchHtml(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

// Concurrency limiter
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

// -------------------------------
// Course discovery (best-effort)
// -------------------------------
function getCoursesFromDashboardDom() {
  // We want only links that point to the course "home" (/courses/<id>)
  // Dashboard can contain many links; filter hard.
  const anchors = Array.from(document.querySelectorAll('a[href*="/courses/"]'));

  const seen = new Set();
  const courses = [];

  for (const a of anchors) {
    const href = a.getAttribute("href");
    if (!href) continue;

    const full = absoluteUrl(href);
    const courseId = parseCourseIdFromHref(full);
    if (!courseId) continue;

    // only accept course home URLs (avoid /courses/<id>/modules etc)
    // We'll accept URLs that end right after the id (or have trailing slash)
    const isHome = /\/courses\/\d+\/?$/.test(new URL(full).pathname);
    if (!isHome) continue;

    if (seen.has(courseId)) continue;
    seen.add(courseId);

    // name best-effort
    const name =
      (a.textContent || "").trim() ||
      (a.closest(".ic-DashboardCard")?.querySelector(".ic-DashboardCard__header-title")?.textContent || "").trim() ||
      `Course ${courseId}`;

    courses.push({
      canvasCourseId: courseId,
      name,
      courseUrl: normalizeCourseHome(courseId),
    });
  }

  return courses;
}

function getSingleCourseFromUrlIfOnCoursePage() {
  // If user isn't on dashboard, they might be inside a course
  const courseId = parseCourseIdFromHref(location.href);
  if (!courseId) return null;
  return {
    canvasCourseId: courseId,
    name: `Course ${courseId}`,
    courseUrl: normalizeCourseHome(courseId),
  };
}

// -------------------------------
// Syllabus entrypoint discovery
//
// Uses multiple strategies to find the correct external tool URL:
//   1. Canvas REST API (/api/v1/courses/:id/tabs) — most reliable
//   2. Parse navigation links from course home HTML
//   3. Hardcoded fallback tool ID
// -------------------------------
async function findSyllabusLaunchUrl(courseId) {
  const courseHome = normalizeCourseHome(courseId);

  // ── Strategy 1: Canvas tabs API ──────────────────────────────
  try {
    const apiRes = await fetch(
      `https://canvas.ku.edu/api/v1/courses/${courseId}/tabs`,
      { credentials: "include", headers: { Accept: "application/json" } }
    );
    if (apiRes.ok) {
      const tabs = await apiRes.json();
      // Look for an external tool tab whose label mentions "syllabus"
      const syllabusTab = tabs.find((t) => {
        const label = (t.label || "").toLowerCase();
        return (
          (label.includes("syllabus") || label.includes("simple syllabus")) &&
          (t.type === "external" || (t.html_url || "").includes("external_tools"))
        );
      });
      if (syllabusTab) {
        const url = syllabusTab.full_url || syllabusTab.html_url;
        if (url) {
          console.log("[findSyllabus] tabs API found:", url);
          return absoluteUrl(url);
        }
      }
    }
  } catch (e) {
    console.warn("[findSyllabus] tabs API failed:", e.message);
  }

  // ── Strategy 2: Parse course home navigation links ───────────
  try {
    const html = await fetchHtml(courseHome);
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Check navigation links
    const navAnchors = Array.from(doc.querySelectorAll("a[href]"));

    const syllabusAnchor = navAnchors.find((a) => {
      const text = (a.textContent || "").toLowerCase();
      if (!text.includes("syllabus")) return false;
      const href = a.getAttribute("href") || "";
      // common: /courses/<id>/external_tools/<toolId> or /courses/<id>/syllabus
      return href.includes(`/courses/${courseId}/`);
    });

    if (syllabusAnchor) {
      const url = absoluteUrl(syllabusAnchor.getAttribute("href"));
      console.log("[findSyllabus] nav link found:", url);
      return url;
    }
  } catch (e) {
    console.warn("[findSyllabus] course home parse failed:", e.message);
  }

  // ── Strategy 3: Hardcoded fallback ───────────────────────────
  const fallback = `${courseHome}/external_tools/2240`;
  console.log("[findSyllabus] using hardcoded fallback:", fallback);
  return fallback;
}

// -------------------------------
// Message handlers
// -------------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Helps background ensure script is injected
  if (msg?.type === "PING") {
    sendResponse({ ok: true, where: location.href });
    return;
  }

  if (msg?.type !== "SCAN_COURSES") return;

  (async () => {
    // Try dashboard discovery; if empty, fallback to current course page
    let courses = getCoursesFromDashboardDom();
    if (!courses.length) {
      const single = getSingleCourseFromUrlIfOnCoursePage();
      if (single) courses = [single];
    }

    // Discover syllabus launch URLs for each course
    // (background.js will handle the actual text capture via hidden tabs)
    const enriched = await mapWithConcurrency(
      courses,
      FETCH_CONCURRENCY,
      async (course) => {
        try {
          const syllabusUrl = await findSyllabusLaunchUrl(course.canvasCourseId);
          return { ...course, syllabusUrl };
        } catch (e) {
          console.warn("[SCAN] Failed to find syllabus URL for", course.canvasCourseId, e.message);
          return { ...course, syllabusUrl: null };
        }
      }
    );

    sendResponse({ ok: true, count: enriched.length, courses: enriched });
  })().catch((e) => {
    sendResponse({ ok: false, error: String(e?.message || e) });
  });

  return true; // keep channel open for async
});
