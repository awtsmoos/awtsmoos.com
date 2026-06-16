// B"H
/**
 * @file pagedSearch.js
 * @brief Flexible paged repository search for tunnel filesystem actions.
 *
 * Chapter 463: The first page stopped pretending it was the whole root.
 * A search that scans five early files and returns no matches can mislead a
 * tired agent into thinking the Awtsmoos hid the relevant file. The river now
 * widens its first pass, accepts the many names agents use for path/query, and
 * still exposes exact continuation cursors when the ocean is larger than one
 * response.
 */

const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { BIN } = require("./constants.js");

const DEFAULT_ROOT_SCAN_FILES = boundedNumber(process.env.AWTSMOOS_SEARCH_DEFAULT_FILES, 300, 25, 5000);
const DEFAULT_MAX_RESULTS = boundedNumber(process.env.AWTSMOOS_SEARCH_DEFAULT_RESULTS, 1000, 10, 100000);
const DEFAULT_MAX_FILE_BYTES = boundedNumber(process.env.AWTSMOOS_SEARCH_MAX_FILE_BYTES, 800000, 0, 64 * 1024 * 1024);
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".cache", "coverage"]);

function boundedNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function firstText(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value) !== "") return String(value);
  }
  return "";
}

function truthy(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sortResults(results, sortBy) {
  const key = String(sortBy || "path");
  const pick = {
    path: x => x.path,
    line: x => x.line,
    mtime: x => -x.mtimeMs,
    size: x => -x.sizeBytes
  }[key] || (x => x.path);
  return results.sort((a, b) => String(pick(a)).localeCompare(String(pick(b)), undefined, { numeric: true }));
}

function normalizeSearchPayload(payload = {}) {
  const rootPath = firstText(payload.path, payload.p, payload.root, payload.cwd, payload.dir, payload.directory, ".") || ".";
  const query = firstText(payload.query, payload.q, payload.find, payload.pattern, payload.text, payload.term, payload.search);
  const page = Math.max(1, num(payload.page, 1));
  const pageSize = Math.max(1, num(payload.pageSize || payload.limit || payload.perPage || payload.take, 100));
  const fileCursor = num(payload.fileCursor ?? payload.cursor ?? payload.offset, 0);
  const strictPage = truthy(payload.strictPage) || truthy(payload.strictPagination);
  const requestedMaxFiles = num(payload.maxFiles ?? payload.scanFiles ?? payload.fileLimit, NaN);
  const minScanFiles = strictPage ? 1 : DEFAULT_ROOT_SCAN_FILES;
  const maxFiles = Math.max(
    1,
    Number.isFinite(requestedMaxFiles)
      ? Math.max(requestedMaxFiles, Math.min(minScanFiles, DEFAULT_ROOT_SCAN_FILES))
      : Math.max(pageSize, minScanFiles)
  );
  const maxResults = Math.max(1, num(payload.maxResults || payload.resultLimit, Math.max(pageSize, DEFAULT_MAX_RESULTS)));
  const maxFileBytes = num(payload.maxFileBytes ?? payload.fileBytes ?? payload.maxBytes, DEFAULT_MAX_FILE_BYTES);
  return { rootPath, query, page, pageSize, fileCursor, maxFiles, maxResults, maxFileBytes, strictPage };
}

async function collectFiles(config, rootPath, start, maxFiles) {
  const files = [];
  const wanted = start + maxFiles + 1;
  const rootFull = safePath(config, rootPath || ".");
  try {
    if ((await fsp.stat(rootFull)).isFile()) {
      return { files: start ? [] : [rootPath || "."], hasMore: false, totalVisited: 1 };
    }
  } catch (_e) {}
  let visited = 0;
  async function walk(rel) {
    if (visited >= wanted) return;
    const items = await listDirDetailed(config, rel || ".");
    for (const item of items) {
      if (visited >= wanted) return;
      const child = rel && rel !== "." ? rel.replace(/[\\/]+$/, "") + "/" + item.name : item.name;
      if (item.isDirectory) {
        if (SKIP_DIRS.has(item.name)) continue;
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
    if (matcher.test(lines[i])) {
      results.push({ path: rel, line: i + 1, preview: lines[i].slice(0, 500), mtimeMs: st.mtimeMs, sizeBytes: st.size });
    }
    matcher.lastIndex = 0;
  }
  return "searched";
}

async function bulkSearch(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const normalized = normalizeSearchPayload(payload);
  const { rootPath, query, page, pageSize, fileCursor, maxFiles, maxResults, maxFileBytes } = normalized;
  if (!query) return { ok: false, action: payload.action || "bulkSearch", error: "missing_query" };
  const matcher = payload.regex
    ? new RegExp(query, payload.caseSensitive ? "" : "i")
    : new RegExp(escapeRegex(query), payload.caseSensitive ? "" : "i");
  const scan = await collectFiles(config, rootPath, fileCursor, maxFiles);
  const results = [];
  let skippedFiles = 0;
  for (const rel of scan.files) {
    if (results.length >= maxResults) break;
    const status = await searchFile(config, rel, matcher, maxFileBytes, results, maxResults);
    if (status === "too_large") skippedFiles++;
  }
  sortResults(results, payload.sortBy);
  return result(config, payload, { ...normalized, scan, results, skippedFiles });
}

function result(config, payload, ctx) {
  const start = (ctx.page - 1) * ctx.pageSize;
  const pageResults = ctx.results.slice(start, start + ctx.pageSize);
  const hasNextResultPage = start + ctx.pageSize < ctx.results.length;
  const hasNextScan = ctx.scan.hasMore;
  const nextResultRequest = hasNextResultPage ? baseRequest(payload, ctx, { page: ctx.page + 1, fileCursor: ctx.fileCursor }) : null;
  const nextScanRequest = hasNextScan ? baseRequest(payload, ctx, { page: 1, fileCursor: ctx.fileCursor + ctx.scan.files.length }) : null;
  const continuationMessage = hasNextScan
    ? "Partial root search. Use nextScanRequest to continue scanning; do not conclude absence from this page alone."
    : "Search page complete.";
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
    totalVisited: ctx.scan.totalVisited,
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
    mustContinueToProveAbsence: hasNextScan,
    continuationGuidance: continuationMessage,
    message: continuationMessage,
    results: pageResults
  };
}

function baseRequest(payload, ctx, extra) {
  return {
    action: payload.action || "bulkSearch",
    p: ctx.rootPath,
    query: ctx.query,
    regex: !!payload.regex,
    caseSensitive: !!payload.caseSensitive,
    pageSize: ctx.pageSize,
    maxFiles: ctx.maxFiles,
    maxResults: ctx.maxResults,
    maxFileBytes: ctx.maxFileBytes,
    ...extra
  };
}

module.exports = { bulkSearch, collectFiles, normalizeSearchPayload, searchFile };
