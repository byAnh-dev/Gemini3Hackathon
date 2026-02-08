console.log("0Effort content.js loaded on:", location.href);

const SYLLABUS_TEXT_CAP = 20000;  // cap for privacy/perf
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

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, noscript").forEach((n) => n.remove());

  const main =
    doc.querySelector("#content") ||
    doc.querySelector(".ic-app-main-content") ||
    doc.querySelector(".ic-Layout-contentMain") ||
    doc.body;

  const text = (main?.innerText || "").replace(/\n{3,}/g, "\n\n").trim();
  return text.slice(0, SYLLABUS_TEXT_CAP);
}

function parseLtiAutoPost(html) {
  // Many LTI launches are: <form method="post" action="https://provider/..."> ... hidden inputs ... </form>
  const doc = new DOMParser().parseFromString(html, "text/html");
  const form = doc.querySelector('form[method="post"][action]');
  if (!form) return null;

  const action = form.getAttribute("action");
  if (!action) return null;

  const inputs = {};
  form.querySelectorAll("input[name]").forEach((inp) => {
    const name = inp.getAttribute("name");
    if (!name) return;
    inputs[name] = inp.getAttribute("value") || "";
  });

  return { action: absoluteUrl(action), inputs };
}

function parseIframeSrc(html) {
  // Sometimes the launch page embeds an iframe directly
  const doc = new DOMParser().parseFromString(html, "text/html");
  const iframe = doc.querySelector("iframe[src]");
  if (!iframe) return null;
  return absoluteUrl(iframe.getAttribute("src"));
}

// Promise wrapper for runtime messaging
function runtimeSendMessage(msg) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (resp) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(resp);
    });
  });
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
// -------------------------------
async function findSyllabusLaunchUrl(courseId) {
  // Strategy:
  // 1) Fetch course home page
  // 2) Look for a nav link with text containing "syllabus"
  // 3) Otherwise fallback to external tool known id 2240
  // 4) Otherwise fallback to /syllabus
  const courseHome = normalizeCourseHome(courseId);
  try {
    const html = await fetchHtml(courseHome);
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Look for "Syllabus" nav link first
    const navAnchors = Array.from(doc.querySelectorAll('a[href]'));

    const syllabusAnchor = navAnchors.find((a) => {
      const text = (a.textContent || "").toLowerCase();
      if (!text.includes("syllabus")) return false;
      const href = a.getAttribute("href") || "";
      // common: /courses/<id>/external_tools/<toolId> or /courses/<id>/syllabus
      return href.includes(`/courses/${courseId}/`);
    });

    if (syllabusAnchor) {
      return absoluteUrl(syllabusAnchor.getAttribute("href"));
    }

    // fallback: external tool
    return `${courseHome}/external_tools/2240`;
  } catch {
    // fallback if home fetch fails
    return `${courseHome}/external_tools/2240`;
  }
}

// -------------------------------
// Syllabus fetcher (handles LTI)
// -------------------------------
async function fetchSyllabusTextFromLaunchUrl(launchUrl) {
  // 1) Fetch launch page HTML (Canvas)
  const launchHtml = await fetchHtml(launchUrl);

  // 2) If LTI auto-post form exists, ask background to POST it
  const lti = parseLtiAutoPost(launchHtml);
  if (lti) {
    const resp = await runtimeSendMessage({
      type: "LTI_POST",
      action: lti.action,
      inputs: lti.inputs,
    });

    if (resp?.ok && resp.html) {
      const text = htmlToText(resp.html);
      return {
        syllabusText: text.length >= 50 ? text : "",
        syllabusProviderUrl: lti.action,
        mode: "LTI_FORM_POST",
        error: null,
      };
    }

    return {
      syllabusText: "",
      syllabusProviderUrl: lti.action,
      mode: "LTI_FORM_POST",
      error: resp?.error || "LTI_POST failed",
    };
  }

  // 3) If there is an iframe src, try fetching that via background (CORS-safe)
  const iframeSrc = parseIframeSrc(launchHtml);
  if (iframeSrc) {
    const resp = await runtimeSendMessage({
      type: "LTI_IFRAME_FETCH",
      url: iframeSrc,
    });

    if (resp?.ok && resp.html) {
      const text = htmlToText(resp.html);
      return {
        syllabusText: text.length >= 50 ? text : "",
        syllabusProviderUrl: iframeSrc,
        mode: "IFRAME_FETCH",
        error: null,
      };
    }

    // If you don't implement LTI_IFRAME_FETCH in background, this will error; that's okay.
    return {
      syllabusText: "",
      syllabusProviderUrl: iframeSrc,
      mode: "IFRAME_FETCH",
      error: resp?.error || "LTI_IFRAME_FETCH failed",
    };
  }

  // 4) Otherwise: just try extracting text from launch page itself
  const text = htmlToText(launchHtml);
  return {
    syllabusText: text.length >= 50 ? text : "",
    syllabusProviderUrl: null,
    mode: "DIRECT_TEXT",
    error: null,
  };
}

async function enrichCourseWithSyllabus(course) {
  const courseId = course.canvasCourseId;
  const syllabusUrl = await findSyllabusLaunchUrl(courseId);

  try {
    const out = await fetchSyllabusTextFromLaunchUrl(syllabusUrl);
    return {
      ...course,
      syllabusUrl,                        // Canvas entrypoint (likely external_tools/2240)
      syllabusProviderUrl: out.syllabusProviderUrl, // provider endpoint used (debug)
      syllabusText: out.syllabusText,      // main result
      syllabusFetchMode: out.mode,         // debug
      syllabusFetchError: out.error,       // debug
    };
  } catch (e) {
    return {
      ...course,
      syllabusUrl,
      syllabusProviderUrl: null,
      syllabusText: "",
      syllabusFetchMode: "ERROR",
      syllabusFetchError: String(e?.message || e),
    };
  }
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

    const enriched = await mapWithConcurrency(
      courses,
      FETCH_CONCURRENCY,
      enrichCourseWithSyllabus
    );

    sendResponse({ ok: true, count: enriched.length, courses: enriched });
  })().catch((e) => {
    sendResponse({ ok: false, error: String(e?.message || e) });
  });

  return true; // keep channel open for async
});
