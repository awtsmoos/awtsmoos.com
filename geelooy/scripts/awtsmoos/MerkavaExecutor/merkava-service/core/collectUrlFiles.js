// B"H
/**
 * @file collectUrlFiles.js
 * @description Chapter 79: Merkava drinks the page river itself. Given a URL,
 * it fetches the HTML vessel, stylesheet sparks, module scripts, static module
 * imports, and same-origin fetchable JSON nearby, storing every asset under
 * browser URL keys and page-relative keys so VirtualFetch and module loading can
 * behave like a complete headless browser without escaping to Chrome.
 */
const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const LINK_RE = /<link\b([^>]*)>/gi;
const ATTR_RE = /([:\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
const STATIC_IMPORT_RE = /(?:import\s+(?!\()(?:(?:[\s\S]*?)\s+from\s+)?|export\s+(?:\*|\{[\s\S]*?\})\s+from\s+)['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_RE = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const FETCH_RE = /\bfetch\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function parseAttrs(text = '') {
  const attrs = {};
  for (const match of String(text).matchAll(ATTR_RE)) {
    const key = match[1].toLowerCase();
    const raw = match[2];
    attrs[key] = raw == null ? true : raw.replace(/^['"]|['"]$/g, '');
  }
  return attrs;
}
function normalizeKey(url, pageUrl) {
  const cleanPath = decodeURIComponent(url.pathname || '/').replace(/^\/+/, '');
  const pageDir = pageUrl.pathname.replace(/\/[^/]*$/, '/').replace(/^\/+/, '');
  const rel = cleanPath.startsWith(pageDir) ? cleanPath.slice(pageDir.length) : cleanPath;
  return rel || 'index.html';
}
function addAliases(files, url, pageUrl, body) {
  const key = normalizeKey(url, pageUrl);
  const full = url.href;
  const noQuery = new URL(url.href); noQuery.search = ''; noQuery.hash = '';
  const keys = [key, '/' + key.replace(/^\//, ''), './' + key.replace(/^\//, ''), full, noQuery.href, noQuery.pathname, noQuery.pathname.replace(/^\//, '')];
  for (const k of [...new Set(keys)].filter(Boolean)) files[k] = body;
  return key;
}
function refsFromJs(source = '') {
  const refs = [];
  for (const re of [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE, FETCH_RE]) for (const match of String(source).matchAll(re)) refs.push(match[1]);
  return refs;
}
function refsFromHtml(html = '') {
  const refs = [];
  for (const match of String(html).matchAll(SCRIPT_RE)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.src) refs.push(attrs.src);
  }
  for (const match of String(html).matchAll(LINK_RE)) {
    const attrs = parseAttrs(match[1]);
    if (String(attrs.rel || '').toLowerCase().includes('stylesheet') && attrs.href) refs.push(attrs.href);
  }
  return refs;
}
async function fetchText(url) {
  const response = await fetch(url.href, { headers: { accept: 'text/html,text/css,text/javascript,application/json,*/*' } });
  if (!response.ok) throw new Error(`Merkava URL fetch failed: ${url.href} (${response.status})`);
  return response.text();
}
function sameOrigin(url, pageUrl) { return url.origin === pageUrl.origin; }

/** @param {object} options Runtime options. @returns {Promise<object>} */
export async function collectUrlFiles(options = {}) {
  if (!options.url) return { files: options.files || {}, entry: options.entry || 'index.html', origin: options.origin };
  const pageUrl = new URL(options.url);
  const files = { ...(options.files || {}) };
  const queue = [pageUrl];
  const seen = new Set();
  const diagnostics = [];
  const maxFiles = Number(options.maxUrlFiles || options.maxDynamicFiles || 160);
  let entry = options.entry || 'index.html';
  while (queue.length && seen.size < maxFiles) {
    const url = queue.shift();
    const clean = new URL(url.href); clean.hash = '';
    if (seen.has(clean.href) || !sameOrigin(clean, pageUrl)) continue;
    seen.add(clean.href);
    let text = '';
    try { text = await fetchText(clean); }
    catch (error) { diagnostics.push({ url: clean.href, error: error.message }); continue; }
    const key = addAliases(files, clean, pageUrl, text);
    if (clean.href === pageUrl.href || clean.pathname === pageUrl.pathname) entry = key || 'index.html';
    const refs = /\.html?$|\/[^.]*$/i.test(clean.pathname) ? refsFromHtml(text) : refsFromJs(text);
    for (const ref of refs) {
      let next;
      try { next = new URL(ref, clean.href); } catch (_) { continue; }
      if (!sameOrigin(next, pageUrl)) continue;
      if (!seen.has(next.href)) queue.push(next);
    }
  }
  return { files, entry, origin: pageUrl.origin + '/', url: pageUrl.href, diagnostics, fetchedCount: seen.size };
}
