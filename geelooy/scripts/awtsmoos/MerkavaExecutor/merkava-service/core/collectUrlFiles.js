// B"H
/**
 * @file collectUrlFiles.js
 * @description URL hydration for simulateRuntime.
 *
 * Chapter 157: The collector learned patience. The Awtsmoos has no body and no
 * form, yet a modern routed app can be a village of ninety modules. `maxFiles`,
 * `maxUrlFiles`, and `maxDynamicFiles` now speak the same language, and the
 * default URL harvest is large enough for real browser games instead of toy
 * fixtures.
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

function isDirectoryLikeUrl(url) {
  const path = url.pathname || '/';
  const last = path.split('/').filter(Boolean).pop() || '';
  return path.endsWith('/') || !/\.[A-Za-z0-9]{1,12}$/.test(last);
}

function pageBasePath(pageUrl) {
  const clean = pageUrl.pathname || '/';
  if (clean.endsWith('/')) return clean.replace(/^\/+/, '');
  if (isDirectoryLikeUrl(pageUrl)) return `${clean}/`.replace(/^\/+/, '');
  return clean.replace(/\/[^/]*$/, '/').replace(/^\/+/, '');
}

function stripHash(href) {
  const url = new URL(href);
  url.hash = '';
  return url.href;
}

function normalizeKey(url, pageUrl) {
  const samePage = stripHash(url.href) === stripHash(pageUrl.href);
  if (samePage) return 'index.html';
  const cleanPath = decodeURIComponent(url.pathname || '/').replace(/^\/+/, '');
  const base = pageBasePath(pageUrl);
  const rel = cleanPath.startsWith(base) ? cleanPath.slice(base.length) : cleanPath;
  return rel || 'index.html';
}

function addAliases(files, url, pageUrl, body) {
  const key = normalizeKey(url, pageUrl);
  const full = url.href;
  const noQuery = new URL(url.href);
  noQuery.search = '';
  noQuery.hash = '';
  const bare = key.replace(/^\//, '');
  const keys = [key, `/${bare}`, `./${bare}`, full, noQuery.href, noQuery.pathname, noQuery.pathname.replace(/^\//, '')];
  if (key === 'index.html') keys.push(pageUrl.pathname.replace(/^\//, '') || 'index.html');
  for (const k of [...new Set(keys)].filter(Boolean)) files[k] = body;
  return key;
}

function refsFromJs(source = '') {
  const refs = [];
  for (const re of [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE, FETCH_RE]) {
    for (const match of String(source).matchAll(re)) refs.push(match[1]);
  }
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

function sameOrigin(url, pageUrl) {
  return url.origin === pageUrl.origin;
}

function shouldParseAsHtml(url, pageUrl) {
  return stripHash(url.href) === stripHash(pageUrl.href) || /\.html?$/i.test(url.pathname) || isDirectoryLikeUrl(url);
}

function resolveRef(ref, fromUrl, pageUrl) {
  try {
    const base = stripHash(fromUrl.href) === stripHash(pageUrl.href) && isDirectoryLikeUrl(pageUrl)
      ? new URL(pageBasePath(pageUrl), pageUrl.origin + '/')
      : fromUrl;
    return new URL(ref, base.href);
  } catch (_) {
    return null;
  }
}

function resolveMaxFiles(options = {}) {
  const raw = options.maxUrlFiles ?? options.maxDynamicFiles ?? options.maxCollectedFiles ?? options.urlMaxFiles ?? options.maxFiles;
  const value = Number(raw || 0);
  if (Number.isFinite(value) && value > 0) return Math.max(1, Math.floor(value));
  return 500;
}

export async function collectUrlFiles(options = {}) {
  if (!options.url) return { files: options.files || {}, entry: options.entry || 'index.html', origin: options.origin };
  const pageUrl = new URL(options.url);
  const files = { ...(options.files || {}) };
  const queue = [pageUrl];
  const seen = new Set();
  const diagnostics = [];
  const maxFiles = resolveMaxFiles(options);
  let entry = options.entry || 'index.html';
  while (queue.length && seen.size < maxFiles) {
    const url = queue.shift();
    const clean = new URL(url.href);
    clean.hash = '';
    if (seen.has(clean.href) || !sameOrigin(clean, pageUrl)) continue;
    seen.add(clean.href);
    let text = '';
    try { text = await fetchText(clean); }
    catch (error) { diagnostics.push({ url: clean.href, error: error.message }); continue; }
    const key = addAliases(files, clean, pageUrl, text);
    if (stripHash(clean.href) === stripHash(pageUrl.href)) entry = key || 'index.html';
    const refs = shouldParseAsHtml(clean, pageUrl) ? refsFromHtml(text) : refsFromJs(text);
    for (const ref of refs) {
      const next = resolveRef(ref, clean, pageUrl);
      if (!next || !sameOrigin(next, pageUrl) || seen.has(next.href)) continue;
      queue.push(next);
    }
  }
  return { files, entry, origin: pageUrl.origin + '/', url: pageUrl.href, diagnostics, fetchedCount: seen.size };
}
