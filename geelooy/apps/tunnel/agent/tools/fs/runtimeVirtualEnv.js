// B"H
const fs = require("fs");
const path = require("path");

const MAX_FILES = 80;
const MAX_BYTES = 512000;

function buildRuntimeVirtualEnv(payload = {}, config = {}) {
  const root = path.resolve(config.root || process.cwd());
  const entryRaw = payload.entry || payload.path || payload.p || "index.html";
  const inline = inlineRuntimeFiles(payload, entryRaw);
  if (inline) return withPreflight({ entry: entryRaw, files: inline, source: "inline" });
  const explicit = parseObject(payload.files || payload.files64, null);
  if (explicit) return withPreflight({ entry: entryRaw, files: explicit, source: "explicit" });
  if (String(payload.files || "") === "[object Object]") {
    return withPreflight({ entry: entryRaw, files: {}, source: "coerced-files", error: "files_object_coerced" });
  }

  const entryAbs = safeJoin(root, entryRaw);
  if (!entryAbs || !fs.existsSync(entryAbs) || !fs.statSync(entryAbs).isFile()) {
    return withPreflight({ entry: entryRaw, files: {}, source: "missing", error: "entry_not_found" });
  }

  const files = {};
  const queue = [entryAbs];
  while (queue.length && Object.keys(files).length < MAX_FILES) {
    const abs = queue.shift();
    const key = slash(path.relative(root, abs));
    if (files[key] !== undefined) continue;
    const stat = fs.statSync(abs);
    if (stat.size > MAX_BYTES) continue;
    const text = fs.readFileSync(abs, "utf8");
    files[key] = text;
    for (const ref of refsFrom(text, key)) {
      const next = safeJoin(root, ref);
      if (next && fs.existsSync(next) && fs.statSync(next).isFile()) queue.push(next);
    }
  }
  return withPreflight({ entry: slash(path.relative(root, entryAbs)), files, source: "path" });
}

function refsFrom(text, fromKey) {
  const refs = [];
  const base = path.dirname(fromKey);
  const add = spec => { if (spec && !/^[a-z]+:/i.test(spec)) refs.push(path.join(base, spec)); };
  for (const m of text.matchAll(/(?:import|export)\s+[^"']*?["']([^"']+)["']/g)) add(m[1]);
  for (const m of text.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) add(m[1]);
  for (const m of text.matchAll(/<(?:script|link)[^>]+(?:src|href)=["']([^"']+)["']/g)) add(m[1]);
  return refs.map(slash);
}

function withPreflight(env) {
  const diagnostics = [];
  for (const [file, source] of Object.entries(env.files || {})) {
    if (!file.endsWith(".js")) continue;
    const got = checkScript(file, source);
    if (!got.ok) diagnostics.push(got);
  }
  return { ...env, diagnostics, ok: !env.error && diagnostics.length === 0 };
}

function checkScript(file, source) {
  try {
    if (/\bimport\s|\bexport\s/.test(source)) return { ok: true, file, skipped: "module_syntax_runtime_checked" };
    new Function(source);
    return { ok: true, file };
  } catch (error) {
    return { ok: false, file, name: error.name, message: error.message, kind: "syntax" };
  }
}

function inlineRuntimeFiles(payload, entryRaw) {
  const html = payload.html || payload.content;
  if (html) return { [slash(entryRaw || "index.html")]: String(html) };
  if (payload.testCode) {
    return {
      [slash(entryRaw || "index.html")]: `<script src="./test.js"></script>`,
      "test.js": String(payload.testCode)
    };
  }
  return null;
}

function inlineRuntimeFiles(payload, entryRaw) {
  const html = payload.html || payload.content;
  if (html) return { [slash(entryRaw || "index.html")]: String(html) };
  if (payload.testCode) {
    return {
      [slash(entryRaw || "index.html")]: `<script src="./test.js"></script>`,
      "test.js": String(payload.testCode)
    };
  }
  return null;
}

function parseObject(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch { return fallback; }
}

function safeJoin(root, rel) {
  const abs = path.resolve(root, String(rel || "."));
  return abs.startsWith(root) ? abs : null;
}

function slash(value) { return String(value || "").replace(/\\/g, "/"); }

module.exports = { buildRuntimeVirtualEnv };
