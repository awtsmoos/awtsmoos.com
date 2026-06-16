// B"H
const fsp = require("fs/promises");
const path = require("path");
const { SKIP, SECRET_FILES } = require("./constants.js");
const { safePath, rel } = require("./pathGuard.js");

/**
 * B"H
 * Chapter: The tree became infinite pages, not a chopped stump.
 */
function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

async function collectTreeRows(config, p, maxDepth, cursor = 0, pageSize = 150) {
  const rootFull = safePath(config, p || ".");
  const rows = [];
  let seen = 0;
  let hasNext = false;
  async function maybePush(full, depth, st) {
    if (seen >= cursor && rows.length < pageSize) rows.push({ path: rel(config, full) || ".", depth, kind: st.isDirectory() ? "dir" : "file", bytes: st.isFile() ? st.size : 0 });
    seen++;
    if (rows.length >= pageSize) hasNext = true;
  }
  async function walk(full, depth) {
    if (rows.length >= pageSize) return;
    const st = await fsp.stat(full);
    await maybePush(full, depth, st);
    if (!st.isDirectory() || depth >= maxDepth || rows.length >= pageSize) return;
    for (const entry of await fsp.readdir(full, { withFileTypes: true })) {
      if (rows.length >= pageSize) return;
      if (SKIP.has(entry.name)) continue;
      if (!config.allowSecrets && SECRET_FILES.has(entry.name)) continue;
      await walk(path.join(full, entry.name), depth + 1);
    }
  }
  await walk(rootFull, 0);
  return { rows, totalVisited: seen, hasNext };
}

function renderRows(rows, rootPath) {
  return rows.map(row => `${"  ".repeat(row.depth)}${path.posix.basename(row.path) || rootPath}${row.kind === "dir" ? "/" : ""}`).join("\n");
}

async function pagedTree(config, payload = {}) {
  if (!config.tools.fsTree) throw new Error("fsTree disabled.");
  const p = payload.path || payload.p || ".";
  const maxDepth = num(payload.maxDepth || payload.depth, 12);
  const pageSize = Math.max(1, num(payload.pageSize || payload.limit, 150));
  const cursor = num(payload.cursor, Math.max(0, (Math.max(1, num(payload.page, 1)) - 1) * pageSize));
  const got = await collectTreeRows(config, p, maxDepth, cursor, pageSize);
  const hasNextPage = got.hasNext;
  const nextCursor = hasNextPage ? cursor + got.rows.length : null;
  const nextRequest = hasNextPage ? { action: payload.action || "tree", p, maxDepth, pageSize, cursor: nextCursor } : null;
  return { ok: true, action: payload.action || "tree", root: config.root, path: p, absolutePath: safePath(config, p), pageSize, cursor, nextCursor, hasNextPage, partial: hasNextPage, nextRequest, returnedRows: got.rows.length, visitedRows: got.totalVisited, message: hasNextPage ? "This is one tree page. Send nextRequest to continue." : "Tree page complete.", treeText: renderRows(got.rows, p), rows: got.rows };
}

module.exports = { pagedTree, collectTreeRows, renderRows };
