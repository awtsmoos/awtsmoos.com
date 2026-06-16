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
 *
 * Chapter 465: Absence became sacred. Search no longer whispers "not found"
 * when only a slice was inspected. It can auto-continue until exhausted or a
 * result budget is reached, it samples huge text files instead of pretending
 * they do not exist, and it tells the next agent exactly what to do.
 */

const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { BIN } = require("./constants.js");

const DEFAULT_ROOT_SCAN_FILES = boundedNumber(process.env.AWTSMOOS_SEARCH_DEFAULT_FILES, 300, 25, 5000);
const DEFAULT_MAX_RESULTS = boundedNumber(process.env.AWTSMOOS_SEARCH_DEFAULT_RESULTS, 1000, 10, 100000);
const DEFAULT_MAX_FILE_BYTES = boundedNumber(process.env.AWTSMOOS_SEARCH_MAX_FILE_BYTES, 800000, 0, 64 * 1024 * 1024);
const DEFAULT_AUTO_SCAN_FILES = boundedNumber(process.env.AWTSMOOS_SEARCH_AUTO_FILES, 5000, 100, 100000);
const DEFAULT_SAMPLE_BYTES = boundedNumber(process.env.AWTSMOOS_SEARCH_SAMPLE_BYTES, 65536, 4096, 1048576);
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
  return value === true || value === "true" || value === "1" || value === 1 || value === "yes";
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
  const autoContinue = truthy(payload.autoContinue) || truthy(payload.continueUntilFound) || truthy(payload.fullScan);
  const requestedMaxFiles = num(payload.maxFiles ?? payload.scanFiles ?? payload.fileLimit, NaN);
  const autoScanFiles = num(payload.autoScanFiles ?? payload.fullScanFiles, DEFAULT_AUTO_SCAN_FILES);
  const minScanFiles = strictPage ? 1 : DEFAULT_ROOT_SCAN_FILES;
  const normalMaxFiles = Number.isFinite(requestedMaxFiles)
    ? Math.max(requestedMaxFiles, Math.min(minScanFiles, DEFAULT_ROOT_SCAN_FILES))
    : Math.max(pageSize, minScanFiles);
  const maxFiles = autoContinue ? Math.max(normalMaxFiles, autoScanFiles) : normalMaxFiles;
  const maxResults = Math.max(1, num(payload.maxResults || payload.resultLimit, Math.max(pageSize, DEFAULT_MAX_RESULTS)));
  const maxFileBytes = num(payload.maxFileBytes ?? payload.fileBytes ?? payload.maxBytes, DEFAULT_MAX_FILE_BYTES);
  const sampleBytes = num(payload.sampleBytes ?? payload.largeFileSampleBytes, DEFAULT_SAMPLE_BYTES);
  return { rootPath, query, page, pageSize, fileCursor, maxFiles, maxResults, maxFileBytes, sampleBytes, strictPage, autoContinue };
}

async function collectFiles(config, rootPath, start, maxFiles) {
  const files = [];
  const wanted = start + maxFiles + 1;
  const rootFull = safePath(config, rootPath || ".");
  try {
    if ((await fsp.stat(rootFull)).isFile()) return { files: start ? [] : [rootPath || "."], hasMore: false, totalVisited: 1 };
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

async function readSamples(full, st, sampleBytes) {
  const third = Math.max(1, Math.floor(sampleBytes / 3));
  const handle = await fsp.open(full, "r");
  try {
    const offsets = [0, Math.max(0, Math.floor(st.size / 2) - Math.floor(third / 2)), Math.max(0, st.size - third)];
    const chunks = [];
    for (const offset of offsets) {
      const buffer = Buffer.alloc(Math.min(third, Math.max(0, st.size - offset)));
      if (!buffer.length) continue;
      const read = await handle.read(buffer, 0, buffer.length, offset);
      chunks.push({ offset, text: buffer.subarray(0, read.bytesRead).toString("utf8") });
    }
    return chunks;
  } finally {
    await handle.close();
  }
}

function pushLineMatches(rel, text, matcher, results, maxResults, meta = {}) {
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length && results.length < maxResults; i++) {
    if (matcher.test(lines[i])) results.push({ path: rel, line: meta.lineOffset ? meta.lineOffset + i + 1 : i + 1, preview: lines[i].slice(0, 500), ...meta });
    matcher.lastIndex = 0;
  }
}

async function searchFile(config, rel, matcher, maxFileBytes, results, maxResults, sampleBytes = DEFAULT_SAMPLE_BYTES) {
  const ext = path.extname(rel).toLowerCase();
  if (BIN.has(ext)) return "binary";
  const full = safePath(config, rel);
  assertNotSecret(config, full);
  const st = await fsp.stat(full);
  if (maxFileBytes > 0 && st.size > maxFileBytes) {
    const before = results.length;
    const samples = await readSamples(full, st, sampleBytes);
    for (const sample of samples) {
      if (results.length >= maxResults) break;
      pushLineMatches(rel, sample.text, matcher, results, maxResults, { sampled: true, sampleOffset: sample.offset, mtimeMs: st.mtimeMs, sizeBytes: st.size });
    }
    return results.length > before ? "sampled_match" : "sampled_no_match";
  }
  pushLineMatches(rel, await fsp.readFile(full, "utf8"), matcher, results, maxResults, { mtimeMs: st.mtimeMs, sizeBytes: st.size });
  return "searched";
}

async function bulkSearch(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const normalized = normalizeSearchPayload(payload);
  const { rootPath, query, page, pageSize, fileCursor, maxFiles, maxResults, maxFileBytes, sampleBytes } = normalized;
  if (!query) return { ok: false, action: payload.action || "bulkSearch", error: "missing_query", recommendedNextAction: "provide_query" };
  const matcher = payload.regex ? new RegExp(query, payload.caseSensitive ? "" : "i") : new RegExp(escapeRegex(query), payload.caseSensitive ? "" : "i");
  const scan = await collectFiles(config, rootPath, fileCursor, maxFiles);
  const results = [];
  const statusCounts = { searched: 0, binary: 0, sampled_match: 0, sampled_no_match: 0 };
  for (const rel of scan.files) {
    if (results.length >= maxResults) break;
    const status = await searchFile(config, rel, matcher, maxFileBytes, results, maxResults, sampleBytes);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  sortResults(results, payload.sortBy);
  return result(config, payload, { ...normalized, scan, results, statusCounts });
}

function result(config, payload, ctx) {
  const start = (ctx.page - 1) * ctx.pageSize;
  const pageResults = ctx.results.slice(start, start + ctx.pageSize);
  const hasNextResultPage = start + ctx.pageSize < ctx.results.length;
  const hasNextScan = ctx.scan.hasMore;
  const hitResultLimit = ctx.results.length >= ctx.maxResults;
  const nextResultRequest = hasNextResultPage ? baseRequest(payload, ctx, { page: ctx.page + 1, fileCursor: ctx.fileCursor }) : null;
  const nextScanRequest = hasNextScan ? baseRequest(payload, ctx, { page: 1, fileCursor: ctx.fileCursor + ctx.scan.files.length }) : null;
  const absenceNotProven = hasNextScan || hitResultLimit;
  const confidence = absenceNotProven ? "partial" : "complete";
  const recommendedNextAction = recommendation(pageResults, hasNextResultPage, hasNextScan, hitResultLimit);
  const continuationGuidance = guidance(recommendedNextAction);
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
    skippedFiles: ctx.statusCounts.binary || 0,
    sampledLargeFiles: (ctx.statusCounts.sampled_match || 0) + (ctx.statusCounts.sampled_no_match || 0),
    sampledLargeFileMatches: ctx.statusCounts.sampled_match || 0,
    partial: hasNextResultPage || hasNextScan || hitResultLimit,
    searchIncomplete: absenceNotProven,
    absenceNotProven,
    mustContinueToProveAbsence: absenceNotProven,
    confidence,
    recommendedNextAction,
    continuationGuidance,
    message: continuationGuidance,
    results: pageResults
  };
}

function recommendation(pageResults, hasNextResultPage, hasNextScan, hitResultLimit) {
  if (hasNextResultPage) return "next_result_page";
  if (pageResults.length) return hasNextScan ? "inspect_results_or_continue_scan" : "inspect_results";
  if (hasNextScan || hitResultLimit) return "continue_scan";
  return "absence_proven_for_scanned_root";
}

function guidance(action) {
  return {
    next_result_page: "More matched results exist. Use nextResultRequest before concluding.",
    inspect_results_or_continue_scan: "Matches were found, but the root scan is partial. Inspect these results or use nextScanRequest to continue.",
    inspect_results: "Search completed and returned matches. Inspect the results.",
    continue_scan: "No returned matches yet, but absence is not proven. Use nextScanRequest or autoContinue:true.",
    absence_proven_for_scanned_root: "Search completed for this root and query. Absence is proven for non-binary files within configured sample limits."
  }[action] || "Continue carefully.";
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
    sampleBytes: ctx.sampleBytes,
    autoContinue: !!ctx.autoContinue,
    ...extra
  };
}

module.exports = { bulkSearch, collectFiles, normalizeSearchPayload, searchFile };
