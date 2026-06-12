// B"H
const fs = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".cache", ".awtsmoos-repo"]);
const DEFAULT_EXTS = [".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx", ".json", ".html", ".css", ".md", ".txt", ".sh", ".ps1", ".yml", ".yaml"];

/**
 * B"H
 * Chapter 8: The Awtsmoos widened the lantern over plain text.
 *
 * A search action that cannot see `.txt` is a torch with a covered eye. This
 * helper turns comma strings or arrays into trimmed vessels, so the default
 * search field can include normal prose, configs, scripts, and source files.
 *
 * @param {string|string[]} value Raw list value.
 * @returns {string[]} Normalized list.
 */
function listOf(value) {
  if (Array.isArray(value)) return value.map(String).map(x => x.trim()).filter(Boolean);
  return String(value || "").split(",").map(x => x.trim()).filter(Boolean);
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMatcher(payload) {
  const terms = listOf(payload.patterns || payload.pattern || payload.query || payload.find);
  if (!terms.length) throw new Error("query, find, pattern, or patterns is required.");
  const body = payload.regex ? terms.join("|") : terms.map(escapeRegex).join("|");
  return { terms, matcher: new RegExp(body, payload.caseSensitive ? "g" : "gi") };
}

function wantedExts(payload) {
  const raw = listOf(payload.exts || payload.ext || payload.include || "");
  const list = raw.length ? raw : DEFAULT_EXTS;
  return new Set(list.map(x => x.startsWith(".") ? x.toLowerCase() : "." + x.toLowerCase()));
}

async function walkFiles(config, dir, out, options) {
  if (out.length >= options.maxFiles) return;
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }

  for (const ent of entries) {
    if (out.length >= options.maxFiles) return;
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) { await walkFiles(config, full, out, options); continue; }
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (options.exts.size && !options.exts.has(ext)) continue;
    assertNotSecret(config, full);
    out.push(full);
  }
}

/**
 * B"H
 * Searches text-like files for one or more patterns.
 *
 * @param {object} config Agent config.
 * @param {object} payload Search payload.
 * @returns {Promise<object>} Search result.
 */
async function selectString(config, payload = {}) {
  const root = safePath(config, payload.path || payload.p || ".");
  const { terms, matcher } = buildMatcher(payload);
  const options = {
    maxFiles: Math.max(1, Math.min(Number(payload.maxFiles || 2000), 10000)),
    maxResults: Math.max(1, Math.min(Number(payload.maxResults || 200), 2000)),
    maxFileBytes: Math.max(1000, Math.min(Number(payload.maxFileBytes || 800000), 5000000)),
    exts: wantedExts(payload)
  };

  const files = [];
  await walkFiles(config, root, files, options);
  const results = [];
  let skippedFiles = 0;

  for (const file of files) {
    if (results.length >= options.maxResults) break;
    let stat;
    try { stat = await fs.stat(file); } catch { continue; }
    if (stat.size > options.maxFileBytes) { skippedFiles++; continue; }

    let text = "";
    try { text = await fs.readFile(file, "utf8"); } catch { skippedFiles++; continue; }

    text.split(/\r?\n/).forEach((line, index) => {
      if (results.length >= options.maxResults) return;
      if (!matcher.test(line)) { matcher.lastIndex = 0; return; }
      matcher.lastIndex = 0;
      results.push({ path: path.relative(config.root, file).replace(/\\/g, "/"), lineNumber: index + 1, line, preview: line.slice(0, 500), sizeBytes: stat.size, mtimeMs: stat.mtimeMs });
    });
  }

  return {
    ok: true,
    action: payload.action || "selectString",
    path: payload.path || payload.p || ".",
    absolutePath: root,
    terms,
    exts: [...options.exts],
    scannedFiles: files.length,
    skippedFiles,
    returnedResults: results.length,
    count: results.length,
    partial: files.length >= options.maxFiles || results.length >= options.maxResults,
    results
  };
}

module.exports = { selectString, DEFAULT_EXTS };
