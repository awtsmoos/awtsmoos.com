// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { BIN } = require("./constants.js");

function clamp(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sortResults(results, sortBy) {
  const key = String(sortBy || "path");
  const pick = {
    path: (x) => x.path,
    line: (x) => x.line,
    mtime: (x) => -x.mtimeMs,
    size: (x) => -x.sizeBytes
  }[key] || ((x) => x.path);
  return results.sort((a, b) => String(pick(a)).localeCompare(String(pick(b)), undefined, { numeric: true }));
}

async function walkFiles(config, rootPath, maxFiles) {
  const files = [];
  const rootFull = safePath(config, rootPath || ".");
  try {
    const stat = await fsp.stat(rootFull);
    if (stat.isFile()) return [rootPath || "."];
  } catch (_) {}
  async function walk(rel) {
    if (files.length >= maxFiles) return;
    const items = await listDirDetailed(config, rel || ".");
    for (const item of items) {
      if (files.length >= maxFiles) return;
      const child = rel && rel !== "." ? rel.replace(/[\\/]+$/, "") + "/" + item.name : item.name;
      if (item.isDirectory) {
        if (["node_modules", ".git", ".next", "dist", "build", ".cache"].includes(item.name)) continue;
        await walk(child);
      } else files.push(child);
    }
  }
  await walk(rootPath || ".");
  return files;
}

/**
 * B"H
 * Searches many files and returns one stable page. The Awtsmoos hides sparks in
 * every line; this action gathers them in ordered vessels so a caller may ask
 * for page after page without drowning the tunnel in one flood.
 *
 * @param {object} config Local tunnel config.
 * @param {object} payload Search payload.
 * @returns {Promise<object>} Paged search response.
 */
async function bulkSearch(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const rootPath = payload.path || payload.p || ".";
  const query = String(payload.query || payload.find || "");
  if (!query) return { ok: false, action: payload.action || "bulkSearch", error: "missing_query" };

  const page = clamp(payload.page, 1, 1, 100000);
  const pageSize = clamp(payload.pageSize || payload.limit, 25, 1, 200);
  const maxFiles = clamp(payload.maxFiles, 500, 1, 3000);
  const maxResults = clamp(payload.maxResults, 1000, 1, 5000);
  const maxFileBytes = clamp(payload.maxFileBytes, 800000, 1000, 2000000);
  const matcher = payload.regex ? new RegExp(query, "i") : new RegExp(escapeRegex(query), "i");
  const rootFull = safePath(config, rootPath);
  const files = await walkFiles(config, rootPath, maxFiles);
  const results = [];
  let skippedFiles = 0;

  for (const rel of files) {
    if (results.length >= maxResults) break;
    const ext = path.extname(rel).toLowerCase();
    if (BIN.has(ext)) continue;
    const full = safePath(config, rel);
    assertNotSecret(config, full);
    const st = await fsp.stat(full);
    if (st.size > maxFileBytes) { skippedFiles++; continue; }
    const text = await fsp.readFile(full, "utf8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length && results.length < maxResults; i++) {
      if (!matcher.test(lines[i])) continue;
      results.push({ path: rel, line: i + 1, preview: lines[i].slice(0, 500), mtimeMs: st.mtimeMs, sizeBytes: st.size });
    }
  }

  sortResults(results, payload.sortBy);
  const start = (page - 1) * pageSize;
  const pageResults = results.slice(start, start + pageSize);
  return {
    ok: true,
    action: payload.action || "bulkSearch",
    root: config.root,
    path: rootPath,
    absolutePath: rootFull,
    query,
    page,
    pageSize,
    totalResults: results.length,
    returnedResults: pageResults.length,
    hasNextPage: start + pageSize < results.length,
    nextPage: start + pageSize < results.length ? page + 1 : null,
    nextRequest: start + pageSize < results.length ? {
      action: payload.action || "bulkSearch",
      p: rootPath,
      query,
      regex: !!payload.regex,
      page: page + 1,
      pageSize,
      maxFiles,
      maxResults,
      maxFileBytes
    } : null,
    nextRequest: start + pageSize < results.length ? {
      action: payload.action || "bulkSearch",
      p: rootPath,
      query,
      regex: !!payload.regex,
      page: page + 1,
      pageSize,
      maxFiles,
      maxResults,
      maxFileBytes
    } : null,
    scannedFiles: files.length,
    skippedFiles,
    partial: files.length >= maxFiles || results.length >= maxResults,
    results: pageResults
  };
}

module.exports = { bulkSearch };
