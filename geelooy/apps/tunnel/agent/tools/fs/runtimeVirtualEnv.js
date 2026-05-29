// B"H
const fs = require("fs");
const path = require("path");

const MAX_FILES = 180;
const MAX_BYTES = 1024 * 1024;
const ENTRY_CANDIDATES = ["index.html", "index.htm", "app.html", "main.html", "index.js", "main.js", "app.js"];

/**
 * B"H
 * Chapter 87: The HTML tag stopped hiding its first script.
 * The collector accepts a folder, discovers an entry page, and walks the same
 * reachable asset graph a browser would begin with: classic scripts, module
 * scripts, stylesheets, CSS imports, CSS urls, static imports, dynamic import
 * string literals, fetch JSON, and require calls.
 */
function buildRuntimeVirtualEnv(payload = {}, config = {}) {
  const root = path.resolve(config.root || process.cwd());
  const entryRaw = payload.entry || payload.path || payload.p || payload.target || "index.html";
  const inline = inlineRuntimeFiles(payload, entryRaw);
  if (inline) return withPreflight({ entry: slash(entryRaw || "index.html"), files: inline, source: "inline" });
  const explicit = parseObject(payload.files || payload.files64, null);
  if (explicit) return withPreflight({ entry: slash(entryRaw), files: explicit, source: "explicit" });
  if (String(payload.files || "") === "[object Object]") return withPreflight({ entry: slash(entryRaw), files: {}, source: "coerced-files", error: "files_object_coerced" });
  const discovered = discoverEntry(root, entryRaw);
  if (!discovered.ok) return withPreflight({ entry: slash(entryRaw), files: {}, source: "missing", error: discovered.error, diagnostics: discovered.diagnostics || [] });
  const files = collectReachableFiles(root, discovered.entryAbs);
  return withPreflight({ entry: slash(path.relative(root, discovered.entryAbs)), files, source: discovered.source, diagnostics: discovered.diagnostics || [] });
}

function discoverEntry(root, entryRaw) {
  const abs = safeJoin(root, entryRaw || ".");
  if (!abs || !fs.existsSync(abs)) return { ok: false, error: "entry_not_found" };
  const stat = fs.statSync(abs);
  if (stat.isFile()) return { ok: true, entryAbs: abs, source: "path" };
  if (!stat.isDirectory()) return { ok: false, error: "entry_not_file_or_directory" };
  const candidates = [...ENTRY_CANDIDATES, ...htmlFiles(abs), ...jsFiles(abs)];
  const seen = new Set();
  for (const name of candidates) {
    const clean = slash(name);
    if (seen.has(clean)) continue;
    seen.add(clean);
    const next = path.join(abs, clean);
    if (fs.existsSync(next) && fs.statSync(next).isFile()) return { ok: true, entryAbs: next, source: "directory", diagnostics: [{ kind: "directory-entry", entry: slash(path.relative(root, next)) }] };
  }
  return { ok: false, error: "directory_entry_not_found", diagnostics: [{ kind: "searched", candidates }] };
}

function htmlFiles(dir) { return safeReadDir(dir).filter(x => /\.html?$/i.test(x)).sort(); }
function jsFiles(dir) { return safeReadDir(dir).filter(x => /\.m?js$/i.test(x)).sort(); }
function safeReadDir(dir) { try { return fs.readdirSync(dir); } catch (_) { return []; } }

function collectReachableFiles(root, entryAbs) {
  const files = {};
  const queue = [entryAbs];
  const seen = new Set();
  while (queue.length && Object.keys(files).length < MAX_FILES) {
    const abs = queue.shift();
    if (!abs || seen.has(abs) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    seen.add(abs);
    const stat = fs.statSync(abs);
    if (stat.size > MAX_BYTES) continue;
    const key = slash(path.relative(root, abs));
    const text = fs.readFileSync(abs, "utf8");
    files[key] = text;
    for (const ref of refsFrom(text, key)) {
      const next = safeJoin(root, ref);
      if (next && fs.existsSync(next) && fs.statSync(next).isFile()) queue.push(next);
    }
  }
  return files;
}

function refsFrom(text, fromKey) {
  const refs = [];
  const base = slash(path.dirname(fromKey));
  const add = spec => {
    const clean = cleanSpec(spec);
    if (!clean || /^[a-z]+:/i.test(clean) || clean.startsWith("//") || clean.startsWith("#") || clean.startsWith("data:")) return;
    refs.push(slash(path.posix.normalize(path.posix.join(base, clean))));
  };
  for (const spec of refsFromHtml(text)) add(spec);
  for (const spec of refsFromCss(text)) add(spec);
  for (const spec of refsFromJs(text)) add(spec);
  return [...new Set(refs)];
}

function refsFromHtml(text = "") {
  const refs = [];
  for (const tag of htmlTags(text)) {
    const attrs = attrsOf(tag.raw);
    if (tag.name === "link" && attrs.href) refs.push(attrs.href);
    if ((tag.name === "a" || tag.name === "form") && /\.html?($|[?#])/i.test(attrs.href || attrs.action || "")) refs.push(attrs.href || attrs.action);
    for (const attr of ["src", "data", "poster"]) if (attrs[attr]) refs.push(attrs[attr]);
  }
  return refs;
}

function htmlTags(text = "") {
  const tags = [];
  for (const match of String(text).matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) tags.push({ name: match[1].toLowerCase(), raw: match[2] || "" });
  return tags;
}

function attrsOf(raw = "") {
  const attrs = {};
  for (const match of String(raw).matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  return attrs;
}

function refsFromCss(text = "") {
  const refs = [];
  for (const m of String(text).matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)["']?\s*\)?/gi)) refs.push(m[1]);
  for (const m of String(text).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.push(m[1]);
  return refs;
}

function refsFromJs(text = "") {
  const refs = [];
  const source = String(text || "");
  for (const m of source.matchAll(/(?:import\s+(?!\()(?:(?:[\s\S]*?)\s+from\s+)?|export\s+(?:\*|\{[\s\S]*?\})\s+from\s+)["']([^"']+)["']/g)) refs.push(m[1]);
  for (const m of source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) refs.push(m[1]);
  for (const m of source.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) refs.push(m[1]);
  for (const m of source.matchAll(/\bfetch\s*\(\s*["']([^"']+)["']\s*\)/g)) refs.push(m[1]);
  return refs;
}

function withPreflight(env) {
  const diagnostics = [...(env.diagnostics || [])];
  for (const [file, source] of Object.entries(env.files || {})) {
    if (/\.m?js$/i.test(file)) pushBad(diagnostics, checkScript(file, source));
    if (/\.html?$/i.test(file)) for (const script of extractInlineScripts(source, file)) pushBad(diagnostics, checkScript(script.file, script.source));
  }
  return { ...env, diagnostics, ok: !env.error && diagnostics.every(x => x.ok !== false) };
}

function pushBad(list, item) { if (item && item.ok === false) list.push(item); }
function extractInlineScripts(html, file) { const scripts = []; let index = 0; for (const match of String(html || "").matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) scripts.push({ file: `${file}#inline-script-${++index}`, source: match[1] || "" }); return scripts; }
function checkScript(file, source) { try { if (/\bimport\s|\bexport\s/.test(source)) return { ok: true, file, skipped: "module_syntax_runtime_checked" }; new Function(source); return { ok: true, file }; } catch (error) { return { ok: false, file, name: error.name, message: error.message, kind: "syntax" }; } }
function inlineRuntimeFiles(payload, entryRaw) { const html = payload.html || payload.content; if (html) return { [slash(entryRaw || "index.html")]: String(html) }; if (payload.testCode) return { [slash(entryRaw || "index.html")]: `<script src="./test.js"></script>`, "test.js": String(payload.testCode) }; return null; }
function parseObject(value, fallback) { if (!value) return fallback; if (typeof value === "object") return value; try { const raw = String(value); const decoded = /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length % 4 === 0 ? Buffer.from(raw, "base64").toString("utf8") : raw; return JSON.parse(decoded); } catch (_) { return fallback; } }
function cleanSpec(spec) { return String(spec || "").split("#")[0].split("?")[0].trim(); }
function safeJoin(root, rel) { const abs = path.resolve(root, String(rel || ".")); return abs.startsWith(root) ? abs : null; }
function slash(value) { return String(value || "").replace(/\\/g, "/"); }

module.exports = { buildRuntimeVirtualEnv, refsFrom, discoverEntry };
