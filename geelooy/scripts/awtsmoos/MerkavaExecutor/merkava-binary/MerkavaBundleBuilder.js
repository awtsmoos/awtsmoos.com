// B"H
const fs = require("fs");
const path = require("path");
const { loadSourcePath, scanHtml, scanCss, scanJs } = require("./Mode2PathLoader.js");
const { compileSourceFilesToMode2 } = require("./SourceAppCompiler.js");
const { encodeMode2JsModuleGraph } = require("./Mode2JsBinary.js");

function normalizeWebPath(file) {
  return file.startsWith("/") ? file : "/" + file.replace(/\\/g, "/");
}

function resolveWeb(spec, from = "/index.html") {
  if (!spec || /^(https?:)?\/\//.test(spec)) return null;
  if (spec.startsWith("/")) return normalizeWebPath(spec);
  const base = from.split("/").slice(0, -1);
  for (const part of spec.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }
  return normalizeWebPath(base.join("/"));
}

function scanKind(file, text) {
  if (/\.html?$/i.test(file)) return scanHtml(text);
  if (/\.css$/i.test(file)) return scanCss(text);
  if (/\.[cm]?js$/i.test(file)) return scanJs(text).concat(scanCjs(text));
  return [];
}

function scanCjs(text = "") {
  const out = [];
  for (const match of text.matchAll(/require\s*\(\s*["']([^"']+)["']\s*\)/g)) {
    if (match[1].startsWith(".")) out.push({ kind: "js", spec: match[1] });
  }
  return out;
}

function collectMemoryFiles({ files = {}, entry = "/index.html" } = {}) {
  const normalized = {};
  for (const [key, value] of Object.entries(files)) normalized[normalizeWebPath(key)] = String(value);
  const seen = new Set();
  const out = {};
  function visit(file) {
    const web = normalizeWebPath(file);
    if (seen.has(web)) return;
    seen.add(web);
    const actual = normalized[web] !== undefined ? web
      : normalized[web + ".js"] !== undefined ? web + ".js"
        : normalized[web + "/index.js"] !== undefined ? web + "/index.js"
          : normalized[web.replace(/^\//, "")] !== undefined ? web.replace(/^\//, "")
            : null;
    const text = actual ? normalized[actual] : undefined;
    if (text == null) return;
    out[web] = text;
    if (actual !== web) out[actual] = text;
    for (const dep of scanKind(actual || web, text)) {
      const next = resolveWeb(dep.spec, actual || web);
      if (next) visit(next);
    }
  }
  visit(entry);
  return { entry: normalizeWebPath(entry), files: out, count: Object.keys(out).length };
}

async function bundleSource(input = {}, options = {}) {
  const source = input.entryPath ? loadSourcePath(input.entryPath, options) : collectMemoryFiles(input);
  const isJs = /\.[cm]?js$/i.test(source.entry);
  const binary = isJs
    ? await encodeMode2JsModuleGraph({ entry: source.entry, files: source.files })
    : await compileSourceFilesToMode2(source);
  return { ok: true, format: "MD2", entry: source.entry, files: source.files, fileCount: Object.keys(source.files).length, binary };
}

async function bundleMerkavaExecutor(rootDir = path.resolve(__dirname, "..")) {
  const bundleRoot = path.basename(rootDir) === "MerkavaExecutor" ? path.dirname(rootDir) : rootDir;
  const files = collectDiskJs(bundleRoot);
  const names = Object.keys(files).sort();
  const html = [
    '<main id="merkava-self" data-kind="source-archive">',
    ...names.map((name, index) => `<section id="file-${index}" data-path="${name}">${name}</section>`),
    '</main>'
  ].join('');
  const binary = await compileSourceFilesToMode2({ entry: "/index.html", files: { "/index.html": html } });
  return { ok: true, format: "MD2", entry: "/index.html", files, fileCount: names.length, binary };
}

function collectDiskJs(rootDir) {
  const files = {};
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.(cjs|js)$/i.test(entry.name)) continue;
      const web = normalizeWebPath(path.relative(rootDir, full));
      let text = fs.readFileSync(full, "utf8");
      if (web.endsWith("/merkavaexecutor.cjs")) {
        const call = "requ" + "ire";
        text = text.replace(new RegExp(call + "\\('\\.\\/merkava-binary'\\)", "g"), call + "('./merkava-binary/index.js')");
      }
      files[web] = text;
    }
  }
  walk(rootDir);
  for (const [web, text] of Object.entries({ ...files })) {
    if (web.endsWith("/index.js")) files[web.slice(0, -"/index.js".length) + ".js"] = text;
  }
  return files;
}

module.exports = { bundleSource, bundleMerkavaExecutor, collectMemoryFiles, collectDiskJs, resolveWeb };
