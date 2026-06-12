// B"H
const fsp = require("fs/promises");
const path = require("path");
const { SKIP, SECRET_FILES } = require("./constants.js");
const { safePath, rel } = require("./pathGuard.js");

/**
 * B"H
 * Chapter 382: The tree became a scroll with a bookmark.
 * Deep folders no longer end with a mute `...limit reached`; they return a
 * nextRequest so the caller can continue the exact revelation through GET.
 */
function num(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

async function collectTreeRows(config, p, maxDepth) {
  const rootFull = safePath(config, p || ".");
  const rows = [];
  async function walk(full, depth) {
    const st = await fsp.stat(full);
    const name = rel(config, full);
    rows.push({ path: name || ".", depth, kind: st.isDirectory() ? "dir" : "file", bytes: st.isFile() ? st.size : 0 });
    if (!st.isDirectory() || depth >= maxDepth) return;
    for (const entry of await fsp.readdir(full, { withFileTypes: true })) {
      if (SKIP.has(entry.name)) continue;
      if (!config.allowSecrets && SECRET_FILES.has(entry.name)) continue;
      await walk(path.join(full, entry.name), depth + 1);
    }
  }
  await walk(rootFull, 0);
  return rows;
}

function renderRows(rows, rootPath) {
  return rows.map(row => `${"  ".repeat(row.depth)}${path.posix.basename(row.path) || rootPath}${row.kind === "dir" ? "/" : ""}`).join("\n");
}

async function pagedTree(config, payload = {}) {
  if (!config.tools.fsTree) throw new Error("fsTree disabled.");
  const p = payload.path || payload.p || ".";
  const maxDepth = num(payload.maxDepth || payload.depth, 2, 0, 12);
  const pageSize = num(payload.pageSize || payload.limit, 150, 1, 1000);
  const cursor = num(payload.cursor, Math.max(0, (num(payload.page, 1, 1, 1000000) - 1) * pageSize), 0, 10000000);
  const rows = await collectTreeRows(config, p, maxDepth);
  const pageRows = rows.slice(cursor, cursor + pageSize);
  const hasNextPage = cursor + pageSize < rows.length;
  const nextCursor = hasNextPage ? cursor + pageSize : null;
  const nextRequest = hasNextPage ? { action: payload.action || "tree", p, maxDepth, pageSize, cursor: nextCursor } : null;
  return {
    ok: true,
    action: payload.action || "tree",
    root: config.root,
    path: p,
    absolutePath: safePath(config, p),
    pageSize,
    cursor,
    nextCursor,
    hasNextPage,
    partial: hasNextPage,
    nextRequest,
    totalRows: rows.length,
    returnedRows: pageRows.length,
    message: hasNextPage ? "This is one tree page. Send nextRequest to continue." : "Tree page complete.",
    treeText: renderRows(pageRows, p),
    rows: pageRows
  };
}

module.exports = { pagedTree, collectTreeRows, renderRows };
