// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".cache"]);

/**
 * B"H
 * Chapter: The file finder stopped fearing millions.
 *
 * There is no tiny hard cap here. The caller may ask for a million-scale scan;
 * the action pages the river with cursor/pageSize, and the server-side peruta
 * account decides whether the journey is affordable.
 */
function int(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function matches(item, options) {
  const name = item.name.toLowerCase();
  const rel = item.relativePath.toLowerCase();
  const q = String(options.query || options.find || "").toLowerCase();
  const ext = String(options.ext || "").toLowerCase().replace(/^\*/, "");
  if (ext && !name.endsWith(ext.startsWith(".") ? ext : "." + ext)) return false;
  if (q && !name.includes(q) && !rel.includes(q)) return false;
  if (options.modifiedAfterMs && item.mtimeMs < Number(options.modifiedAfterMs)) return false;
  return true;
}

async function findFiles(config, payload = {}) {
  const start = safePath(config, payload.path || payload.p || ".");
  const includeDirs = payload.includeDirs === true || payload.includeDirs === "true";
  const pageSize = Math.max(1, int(payload.pageSize || payload.maxResults || payload.limit, 100));
  const cursor = int(payload.cursor || payload.offset || 0, 0);
  const maxEntries = Math.max(cursor + pageSize, int(payload.maxEntries, Number.MAX_SAFE_INTEGER));
  const results = [];
  let visited = 0;
  let matched = 0;
  let skipped = 0;

  async function push(item) {
    if (!matches(item, payload)) return;
    if (matched >= cursor && results.length < pageSize) results.push(item);
    matched++;
  }

  async function walk(full) {
    if (visited >= maxEntries || results.length >= pageSize) return;
    let entries = [];
    try { entries = await fsp.readdir(full, { withFileTypes: true }); }
    catch (_e) { return; }

    for (const entry of entries) {
      if (visited >= maxEntries || results.length >= pageSize) return;
      const next = path.join(full, entry.name);
      const rel = path.relative(config.root, next).replace(/\\/g, "/");
      visited++;
      if (entry.isDirectory()) {
        let st = null;
        if (includeDirs) {
          try { st = await fsp.stat(next); await push({ path: rel, relativePath: rel, name: entry.name, isDirectory: true, sizeBytes: 0, mtimeMs: st.mtimeMs }); }
          catch (_e) { skipped++; }
        }
        if (!SKIP_DIRS.has(entry.name)) await walk(next);
        continue;
      }
      if (!entry.isFile()) continue;
      try {
        assertNotSecret(config, next);
        const st = await fsp.stat(next);
        await push({ path: rel, relativePath: rel, name: entry.name, isFile: true, sizeBytes: st.size, mtimeMs: st.mtimeMs });
      } catch (_e) { skipped++; }
    }
  }

  await walk(start);
  const nextCursor = results.length === pageSize ? cursor + results.length : null;
  return {
    ok: true,
    action: payload.action || "findFiles",
    path: payload.path || payload.p || ".",
    absolutePath: start,
    query: payload.query || payload.find || "",
    ext: payload.ext || "",
    cursor,
    nextCursor,
    pageSize,
    visited,
    matchedSoFar: matched,
    returnedResults: results.length,
    skippedFiles: skipped,
    hasNextPage: nextCursor !== null,
    partial: nextCursor !== null,
    nextRequest: nextCursor !== null ? { ...payload, action: payload.action || "findFiles", cursor: nextCursor, pageSize } : null,
    results
  };
}

module.exports = { findFiles, matches };
