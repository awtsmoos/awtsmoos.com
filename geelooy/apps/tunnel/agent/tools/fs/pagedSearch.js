// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { BIN } = require("./constants.js");

/**
 * B"H
 * Chapter: Search Became A Million-File River.
 *
 * No hard 3,000-file ceiling remains. The scan is cursor-paged, the response is
 * page-sized, and the server-side peruta guard decides whether the scale is
 * affordable before this agent is asked to spend the machine's breath.
 */
function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function escapeRegex(text) { return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function sortResults(results, sortBy) {
  const key = String(sortBy || "path");
  const pick = { path: x => x.path, line: x => x.line, mtime: x => -x.mtimeMs, size: x => -x.sizeBytes }[key] || (x => x.path);
  return results.sort((a, b) => String(pick(a)).localeCompare(String(pick(b)), undefined, { numeric: true }));
}

async function collectFiles(config, rootPath, start, maxFiles) {
  const files = [];
  const wanted = start + maxFiles + 1;
  const rootFull = safePath(config, rootPath || ".");
  try { if ((await fsp.stat(rootFull)).isFile()) return { files: start ? [] : [rootPath || "."], hasMore: false, totalVisited: 1 }; } catch (_) {}
  let visited = 0;
  async function walk(rel) {
    if (visited >= wanted) return;
    const items = await listDirDetailed(config, rel || ".");
    for (const item of items) {
      if (visited >= wanted) return;
      const child = rel && rel !== "." ? rel.replace(/[\\/]+$/, "") + "/" + item.name : item.name;
      if (item.isDirectory) {
        if (["node_modules", ".git", ".next", "dist", "build", ".cache"].includes(item.name)) continue;
        await walk(child);
      } else {
        if (visited >= start && files.length < maxFiles) files.push(child);
        visited++;
      }
    }
  }
  await walk(rootPath || ".");
  return { files, hasMore: visited > start + files.length, totalVisited: visited };
}

async function searchFile(config, rel, matcher, maxFileBytes, results, maxResults) {
  const ext = path.extname(rel).toLowerCase();
  if (BIN.has(ext)) return "binary";
  const full = safePath(config, rel);
  assertNotSecret(config, full);
  const st = await fsp.stat(full);
  if (maxFileBytes > 0 && st.size > maxFileBytes) return "too_large";
  const lines = (await fsp.readFile(full, "utf8")).split(/\r?\n/);
  for (let i = 0; i < lines.length && results.length < maxResults; i++) {
    if (matcher.test(lines[i])) results.push({ path: rel, line: i + 1, preview: lines[i].slice(0, 500), mtimeMs: st.mtimeMs, sizeBytes: st.size });
    matcher.lastIndex = 0;
  }
  return "searched";
}

async function bulkSearch(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const rootPath = payload.path || payload.p || ".";
  const query = String(payload.query || payload.find || "");
  if (!query) return { ok: false, action: payload.action || "bulkSearch", error: "missing_query" };
  const page = Math.max(1, num(payload.page, 1));
  const pageSize = Math.max(1, num(payload.pageSize || payload.limit, 100));
  const fileCursor = num(payload.fileCursor || payload.cursor, 0);
  const maxFiles = Math.max(1, num(payload.maxFiles, pageSize));
  const maxResults = Math.max(1, num(payload.maxResults, Math.max(pageSize, 1000)));
  const maxFileBytes = num(payload.maxFileBytes, 0);
  const matcher = payload.regex ? new RegExp(query, payload.caseSensitive ? "" : "i") : new RegExp(escapeRegex(query), payload.caseSensitive ? "" : "i");
  const scan = await collectFiles(config, rootPath, fileCursor, maxFiles);
  const results = [];
  let skippedFiles = 0;
  for (const rel of scan.files) {
    if (results.length >= maxResults) break;
    const status = await searchFile(config, rel, matcher, maxFileBytes, results, maxResults);
    if (status === "too_large") skippedFiles++;
  }
  sortResults(results, payload.sortBy);
  return result(config, payload, { rootPath, query, page, pageSize, fileCursor, maxFiles, maxResults, maxFileBytes, scan, results, skippedFiles });
}

function result(config, payload, ctx) {
  const start = (ctx.page - 1) * ctx.pageSize;
  const pageResults = ctx.results.slice(start, start + ctx.pageSize);
  const hasNextResultPage = start + ctx.pageSize < ctx.results.length;
  const hasNextScan = ctx.scan.hasMore;
  const nextResultRequest = hasNextResultPage ? baseRequest(payload, ctx, { page: ctx.page + 1, fileCursor: ctx.fileCursor }) : null;
  const nextScanRequest = hasNextScan ? baseRequest(payload, ctx, { page: 1, fileCursor: ctx.fileCursor + ctx.scan.files.length }) : null;
  return {
    ok: true,
    action: payload.action || "bulkSearch",
    root: config.root,
    path: ctx.rootPath,
    absolutePath: safePath(config, ctx.rootPath),
    query: ctx.query,
    page: ctx.page,
    pageSize: ctx.pageSize,
    fileCursor: ctx.fileCursor,
    nextFileCursor: hasNextScan ? ctx.fileCursor + ctx.scan.files.length : null,
    totalResults: ctx.results.length,
    returnedResults: pageResults.length,
    hasNextPage: hasNextResultPage,
    nextPage: hasNextResultPage ? ctx.page + 1 : null,
    hasNextScan,
    nextRequest: nextResultRequest || nextScanRequest,
    nextResultRequest,
    nextScanRequest,
    scannedFiles: ctx.scan.files.length,
    skippedFiles: ctx.skippedFiles,
    partial: hasNextResultPage || hasNextScan || ctx.results.length >= ctx.maxResults,
    message: hasNextScan ? "This is one search page. Send nextScanRequest to continue searching more files." : "Search page complete.",
    results: pageResults
  };
}

function baseRequest(payload, ctx, extra) {
  return { action: payload.action || "bulkSearch", p: ctx.rootPath, query: ctx.query, regex: !!payload.regex, pageSize: ctx.pageSize, maxFiles: ctx.maxFiles, maxResults: ctx.maxResults, maxFileBytes: ctx.maxFileBytes, ...extra };
}

module.exports = { bulkSearch, collectFiles, searchFile };
