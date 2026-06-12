// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".cache"]);

/**
 * B"H
 * Checks whether a file entry matches the simple search shape.
 *
 * @param {object} item File item.
 * @param {object} options Search options.
 * @returns {boolean} Whether it matches.
 */
function matches(item, options) {
  const name = item.name.toLowerCase();
  const rel = item.relativePath.toLowerCase();
  const q = String(options.query || "").toLowerCase();
  const ext = String(options.ext || "").toLowerCase().replace(/^\*/, "");

  if (ext && !name.endsWith(ext.startsWith(".") ? ext : "." + ext)) return false;
  if (q && !name.includes(q) && !rel.includes(q)) return false;
  if (options.modifiedAfterMs && item.mtimeMs < Number(options.modifiedAfterMs)) return false;
  return true;
}

/**
 * B"H
 * Finds files by name/path/extension without invoking shell glob spells.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Search result.
 */
async function findFiles(config, payload = {}) {
  const start = safePath(config, payload.path || payload.p || ".");
  const includeDirs = payload.includeDirs === true;
  const maxResults = Math.max(1, Math.min(Number(payload.maxResults || 120), 500));
  const maxEntries = Math.max(maxResults, Math.min(Number(payload.maxEntries || 3000), 20000));
  const results = [];
  let visited = 0;

  async function walk(full) {
    if (visited >= maxEntries || results.length >= maxResults) return;

    let entries = [];
    try { entries = await fsp.readdir(full, { withFileTypes: true }); }
    catch (_e) { return; }

    for (const entry of entries) {
      if (visited >= maxEntries || results.length >= maxResults) return;

      const next = path.join(full, entry.name);
      const rel = path.relative(config.root, next).replace(/\\/g, "/");
      visited++;

      if (entry.isDirectory()) {
        if (includeDirs) {
          const st = await fsp.stat(next);
          const item = { path: rel, relativePath: rel, name: entry.name, isDirectory: true, sizeBytes: 0, mtimeMs: st.mtimeMs };
          if (matches(item, payload)) results.push(item);
        }
        if (!SKIP_DIRS.has(entry.name)) await walk(next);
        continue;
      }

      if (entry.isFile()) {
        assertNotSecret(config, next);
        const st = await fsp.stat(next);
        const item = { path: rel, relativePath: rel, name: entry.name, isFile: true, sizeBytes: st.size, mtimeMs: st.mtimeMs };
        if (matches(item, payload)) results.push(item);
      }
    }
  }

  await walk(start);

  return {
    ok: true,
    action: "findFiles",
    path: payload.path || payload.p || ".",
    absolutePath: start,
    query: payload.query || "",
    ext: payload.ext || "",
    visited,
    returnedResults: results.length,
    partial: visited >= maxEntries || results.length >= maxResults,
    results
  };
}

module.exports = { findFiles };
