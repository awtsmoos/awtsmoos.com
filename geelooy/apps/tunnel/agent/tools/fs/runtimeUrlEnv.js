// B"H
const path = require("path");

const MAX_URL_FILES = 80;
const MAX_URL_BYTES = 512000;

/**
 * B"H
 * Chapter 1: The Awtsmoos breathed through a URL, and the distant page
 * became near, letter by letter, like rain gathered into one cup.
 *
 * Collects a browser-facing URL into the same file map used by the Merkava
 * runtime. The page itself becomes `index.html`; same-origin scripts, styles,
 * modules, import-map entries, and CSS imports become deterministic virtual
 * files. Import-map JSON is preserved for dependency discovery, then removed
 * from executable HTML because a browser does not run it as JavaScript.
 *
 * @param {object} payload Runtime action payload containing a `url` string.
 * @returns {Promise<object|null>} Virtual env or null when no URL collection is needed.
 */
async function buildRuntimeUrlEnv(payload = {}) {
  if (!shouldCollectUrl(payload)) return null;
  const pageUrl = new URL(String(payload.url));
  const files = {};
  const seen = new Set();
  const queue = [{ url: pageUrl.href, key: "index.html", kind: "html" }];

  while (queue.length && Object.keys(files).length < maxFiles(payload)) {
    const job = queue.shift();
    if (seen.has(job.url) || files[job.key] !== undefined) continue;
    seen.add(job.url);
    const got = await fetchBrowserText(job.url, payload);
    if (!got.ok) continue;
    const refs = refsFrom(got.text, job.key, job.url, job.kind);
    files[job.key] = normalizeFetchedText(got.text, job.kind);
    enqueueRefs({ refs, pageUrl, files, queue, seen, payload });
  }

  if (!files["index.html"]) {
    return { entry: "index.html", files: {}, source: "url", error: "url_entry_not_loaded", diagnostics: [], ok: false };
  }

  return { entry: "index.html", files, source: "url", rootUrl: pageUrl.href, diagnostics: [], ok: true };
}

function enqueueRefs({ refs, pageUrl, files, queue, seen, payload }) {
  for (const ref of refs) {
    if (Object.keys(files).length + queue.length >= maxFiles(payload)) break;
    if (!sameOrigin(pageUrl, ref.url)) continue;
    if (!seen.has(ref.url) && files[ref.key] === undefined) queue.push(ref);
  }
}

function shouldCollectUrl(payload = {}) {
  if (!payload.url || payload.html || payload.content || payload.files || payload.files64) return false;
  const entry = payload.entry || payload.path || payload.p || payload.target;
  return !entry || String(entry).trim() === "." || /^[a-z]+:\/\//i.test(String(entry));
}

async function fetchBrowserText(url, payload = {}) {
  const response = await fetch(url, { headers: { accept: acceptFor(url) } });
  if (!response.ok) return { ok: false, status: response.status, url };
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > maxBytes(payload)) return { ok: false, status: response.status, url, tooLarge: true };
  return { ok: true, status: response.status, url, text: buffer.toString("utf8") };
}

function refsFrom(text, fromKey, fromUrl, kind) {
  const refs = [];
  const push = spec => {
    const resolved = resolveUrl(spec, fromUrl);
    if (!resolved) return;
    refs.push({ url: resolved.href, key: keyFor(spec, fromKey, resolved), kind: kindFor(resolved.pathname) });
  };
  for (const spec of htmlRefs(text, kind)) push(spec);
  for (const spec of jsRefs(text, kind)) push(spec);
  for (const spec of cssRefs(text, kind)) push(spec);
  return refs;
}

function htmlRefs(text, kind) {
  if (kind !== "html") return [];
  const refs = [];
  for (const match of String(text || "").matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)) refs.push(match[1]);
  for (const match of String(text || "").matchAll(/<script[^>]+type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/gi)) refs.push(...importMapRefs(match[1]));
  return refs;
}

function jsRefs(text, kind) {
  if (kind !== "js" && kind !== "html") return [];
  const refs = [];
  const source = String(text || "");
  for (const match of source.matchAll(/\bimport\s+(?:[^('";]+?\s+from\s+)?["']([^"']+)["']/g)) refs.push(match[1]);
  for (const match of source.matchAll(/\bexport\s+[^;"']*?\s+from\s+["']([^"']+)["']/g)) refs.push(match[1]);
  for (const match of source.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) refs.push(match[1]);
  return refs;
}

function cssRefs(text, kind) {
  if (kind !== "css") return [];
  return [...String(text || "").matchAll(/@import\s+(?:url\()?['"]?([^'";)]+)['"]?\)?/g)].map(x => x[1]);
}

function importMapRefs(source) {
  try {
    const map = JSON.parse(String(source || "{}"));
    return Object.values(map.imports || {}).filter(value => typeof value === "string" && !value.endsWith("/"));
  } catch (_) { return []; }
}

function normalizeFetchedText(text, kind) {
  if (kind !== "html") return text;
  return String(text || "").replace(/<script[^>]+type=["']importmap["'][^>]*>[\s\S]*?<\/script>/gi, "");
}

function resolveUrl(spec, base) {
  if (!spec || spec.startsWith("data:") || spec.startsWith("blob:")) return null;
  try { return new URL(spec, base); } catch (_) { return null; }
}

function keyFor(spec, fromKey, url) {
  const cleanSpec = String(spec || "").split(/[?#]/)[0];
  if (cleanSpec.startsWith("/")) return slash(cleanSpec.replace(/^\/+/, ""));
  if (/^[a-z]+:\/\//i.test(cleanSpec)) return slash(url.pathname.replace(/^\/+/, ""));
  return slash(path.normalize(path.join(path.dirname(fromKey), cleanSpec || "index.html")));
}

function kindFor(pathname) {
  if (/\.m?js$/i.test(pathname)) return "js";
  if (/\.css$/i.test(pathname)) return "css";
  if (/\.html?$/i.test(pathname) || !path.extname(pathname)) return "html";
  return "asset";
}

function sameOrigin(root, candidate) {
  const got = typeof candidate === "string" ? new URL(candidate) : candidate;
  return root.origin === got.origin;
}

function acceptFor(url) {
  return /\.css$/i.test(url) ? "text/css,*/*" : /\.m?js$/i.test(url) ? "text/javascript,*/*" : "text/html,*/*";
}

function maxFiles(payload) { return Number(payload.maxFiles || payload.fileLimit || MAX_URL_FILES); }
function maxBytes(payload) { return Number(payload.maxBytes || payload.byteLimit || MAX_URL_BYTES); }
function slash(value) { return String(value || "").replace(/\\/g, "/"); }

module.exports = { buildRuntimeUrlEnv, shouldCollectUrl };
