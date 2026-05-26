// B"H
/**
 * Path loader for MODE2 source apps.
 * Given an HTML entry path, it walks linked CSS, @import CSS, script src,
 * and static JS imports into an in-memory files map keyed by web paths.
 */
const fs = require('fs');
const path = require('path');

function toWebPath(abs, root) {
  return '/' + path.relative(root, abs).replace(/\\/g, '/');
}
function readUtf8(abs) { return fs.readFileSync(abs, 'utf8'); }
function resolveDisk(spec, fromFile, root) {
  if (!spec) return null;
  if (/^(https?:)?\/\//.test(spec)) return null;
  return path.resolve(spec.startsWith('/') ? root : path.dirname(fromFile), spec.replace(/^\//, ''));
}
function scanHtml(text) {
  const out = [];
  for (const m of text.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)) out.push({ kind: 'css', spec: m[1] });
  for (const m of text.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)) out.push({ kind: 'js', spec: m[1] });
  return out;
}
function scanCss(text) {
  return [...text.matchAll(/@import\s+(?:url\()?['"]?([^'"\)]+)['"]?\)?\s*;/g)].map(m => ({ kind: 'css', spec: m[1] }));
}
function scanJs(text) {
  const out = [];
  for (const m of text.matchAll(/import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g)) out.push({ kind: 'js', spec: m[1] });
  for (const m of text.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push({ kind: 'js', spec: m[1] });
  return out;
}
function loadSourcePath(entryPath, options = {}) {
  const entryAbs = path.resolve(entryPath);
  const root = path.resolve(options.root || path.dirname(entryAbs));
  const files = {}, seen = new Set();
  function visit(abs, kind) {
    if (!abs || seen.has(abs)) return;
    seen.add(abs);
    const text = readUtf8(abs);
    const web = toWebPath(abs, root);
    files[web] = text;
    const deps = kind === 'html' ? scanHtml(text) : kind === 'css' ? scanCss(text) : scanJs(text);
    for (const dep of deps) visit(resolveDisk(dep.spec, abs, root), dep.kind);
  }
  visit(entryAbs, 'html');
  return { files, entry: toWebPath(entryAbs, root), root, entryPath: entryAbs, count: Object.keys(files).length };
}
module.exports = { loadSourcePath, scanHtml, scanCss, scanJs };
