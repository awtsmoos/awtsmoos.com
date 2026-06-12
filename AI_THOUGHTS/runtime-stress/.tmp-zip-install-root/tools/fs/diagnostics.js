// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".cache"]);

/**
 * B"H
 * Walks a tree with bounded breath, skipping heavy generated caverns.
 *
 * @param {object} config Agent config.
 * @param {string} rootFull Absolute root.
 * @param {number} maxEntries Maximum entries.
 * @param {Function} visit Visitor.
 * @returns {Promise<number>} Visited count.
 */
async function walkBounded(config, rootFull, maxEntries, visit) {
  let visited = 0;

  async function walk(full) {
    if (visited >= maxEntries) return;

    let entries = [];
    try { entries = await fsp.readdir(full, { withFileTypes: true }); }
    catch (_e) { return; }

    for (const entry of entries) {
      if (visited >= maxEntries) return;

      const next = path.join(full, entry.name);
      const rel = path.relative(config.root, next).replace(/\\/g, "/");
      visited++;

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(next);
        continue;
      }

      if (entry.isFile()) {
        assertNotSecret(config, next);
        const st = await fsp.stat(next);
        await visit({ path: rel, absolutePath: next, name: entry.name, sizeBytes: st.size, mtimeMs: st.mtimeMs });
      }
    }
  }

  await walk(rootFull);
  return visited;
}

/**
 * B"H
 * Lists recently modified files.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Recent file result.
 */
async function recentFiles(config, payload = {}) {
  const root = safePath(config, payload.path || payload.p || ".");
  const sinceMinutes = Math.max(1, Math.min(Number(payload.sinceMinutes || 120), 60 * 24 * 30));
  const sinceMs = Date.now() - sinceMinutes * 60 * 1000;
  const maxResults = Math.max(1, Math.min(Number(payload.maxResults || 100), 500));
  const found = [];

  const visited = await walkBounded(config, root, Number(payload.maxEntries || 10000), item => {
    if (item.mtimeMs >= sinceMs) found.push(item);
  });

  found.sort((a, b) => b.mtimeMs - a.mtimeMs);

  return {
    ok: true,
    action: "recentFiles",
    path: payload.path || payload.p || ".",
    sinceMinutes,
    visited,
    returnedResults: Math.min(found.length, maxResults),
    results: found.slice(0, maxResults)
  };
}

/**
 * B"H
 * Finds large files so agents avoid swallowing boulders whole.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Large file result.
 */
async function largeFiles(config, payload = {}) {
  const root = safePath(config, payload.path || payload.p || ".");
  const minBytes = Math.max(1, Number(payload.minBytes || 500000));
  const maxResults = Math.max(1, Math.min(Number(payload.maxResults || 100), 500));
  const found = [];

  const visited = await walkBounded(config, root, Number(payload.maxEntries || 10000), item => {
    if (item.sizeBytes >= minBytes) found.push(item);
  });

  found.sort((a, b) => b.sizeBytes - a.sizeBytes);

  return {
    ok: true,
    action: "largeFiles",
    path: payload.path || payload.p || ".",
    minBytes,
    visited,
    returnedResults: Math.min(found.length, maxResults),
    results: found.slice(0, maxResults)
  };
}

/**
 * B"H
 * Finds repeated basenames such as many index.js or config.js files.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Duplicate basename result.
 */
async function duplicateBasenames(config, payload = {}) {
  const root = safePath(config, payload.path || payload.p || ".");
  const maxResults = Math.max(1, Math.min(Number(payload.maxResults || 100), 300));
  const groups = new Map();

  const visited = await walkBounded(config, root, Number(payload.maxEntries || 10000), item => {
    const arr = groups.get(item.name) || [];
    arr.push(item.path);
    groups.set(item.name, arr);
  });

  const results = [...groups.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([name, paths]) => ({ name, count: paths.length, paths: paths.slice(0, 50) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxResults);

  return {
    ok: true,
    action: "duplicateBasenames",
    path: payload.path || payload.p || ".",
    visited,
    returnedResults: results.length,
    results
  };
}

/**
 * B"H
 * Counts files, bytes, and text lines under a folder.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Stats.
 */
async function textStats(config, payload = {}) {
  const root = safePath(config, payload.path || payload.p || ".");
  let files = 0;
  let bytes = 0;
  let lines = 0;
  const biggest = [];

  const visited = await walkBounded(config, root, Number(payload.maxEntries || 5000), async item => {
    files++;
    bytes += item.sizeBytes;
    biggest.push(item);
    biggest.sort((a, b) => b.sizeBytes - a.sizeBytes);
    biggest.length = Math.min(biggest.length, 20);

    if (item.sizeBytes <= Number(payload.maxLineFileBytes || 500000)) {
      try {
        const text = await fsp.readFile(item.absolutePath, "utf8");
        lines += text.split(/\r?\n/).length;
      } catch (_e) {}
    }
  });

  return {
    ok: true,
    action: "textStats",
    path: payload.path || payload.p || ".",
    visited,
    files,
    bytes,
    lines,
    biggest
  };
}

module.exports = { recentFiles, largeFiles, duplicateBasenames, textStats };
