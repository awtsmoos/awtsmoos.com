//B"H
/**
 * @file commentThreads.js
 * @description Platform thread events stored outside packed audit.
 */

const ROOT = "/social/platform/commentThreads";

function memory() {
  if (!globalThis.__awtsmoosPlatformThreadMemory) globalThis.__awtsmoosPlatformThreadMemory = new Map();
  return globalThis.__awtsmoosPlatformThreadMemory;
}

function safePart(value) { return encodeURIComponent(String(value || "root")); }
function threadBase(postId) { return `${ROOT}/${safePart(postId)}`; }
function threadPath({ postId, commentId }) { return `${threadBase(postId)}/${safePart(commentId)}.awtsmoosJSON`; }

function normalizeThreadComment({ postId, commentId, parentId = "", aliasId = "", content = "" }) {
  return { postId, commentId, parentId, aliasId, content, score: 0, createdAt: Date.now(), storageType: "platform-thread-event" };
}

function remember(comment) {
  const key = String(comment.postId || "");
  if (!memory().has(key)) memory().set(key, new Map());
  memory().get(key).set(String(comment.commentId || ""), comment);
}

async function writeThreadRecord({ $i, comment }) {
  if (!$i?.db?.write || !comment.postId || !comment.commentId) return { skipped: true, reason: "missing_db_or_ids" };
  return await $i.db.write(threadPath({ postId: comment.postId, commentId: comment.commentId }), comment);
}

async function readThreadIds({ $i, postId }) {
  try {
    const value = await $i.db.get(threadBase(postId));
    if (Array.isArray(value)) return value.map(name => String(name).replace(/\.awtsmoosJSON$/i, ""));
    if (value && typeof value === "object") return Object.keys(value).map(name => String(name).replace(/\.awtsmoosJSON$/i, ""));
  } catch {}
  return [];
}

async function readThreadRecord({ $i, postId, commentId }) {
  try {
    const value = await $i.db.get(threadPath({ postId, commentId }), { max: true });
    if (value && typeof value === "object" && !Buffer.isBuffer(value)) return value;
  } catch {}
  return null;
}

async function storedComments({ $i, postId }) {
  const rows = [];
  for (const commentId of await readThreadIds({ $i, postId })) {
    const row = await readThreadRecord({ $i, postId, commentId });
    if (row) rows.push(row);
  }
  return rows;
}

function memoryComments(postId) {
  return Array.from(memory().get(String(postId || ""))?.values?.() || []);
}

function rank(comments) {
  const replyCounts = new Map();
  for (const comment of comments) if (comment.parentId) replyCounts.set(comment.parentId, (replyCounts.get(comment.parentId) || 0) + 1);
  return comments.map(comment => ({ ...comment, rank: (replyCounts.get(comment.commentId) || 0) + (comment.score || 0) })).sort((a, b) => b.rank - a.rank || a.createdAt - b.createdAt);
}

async function appendThreadComment(params) {
  const comment = normalizeThreadComment(params || {});
  remember(comment);
  const written = await writeThreadRecord({ $i: params.$i, comment });
  return { ...comment, written, packedAuditWritten: false };
}

async function rankedThread({ $i, postId }) {
  const byId = new Map();
  for (const comment of memoryComments(postId)) byId.set(comment.commentId, comment);
  for (const comment of await storedComments({ $i, postId })) byId.set(comment.commentId, comment);
  return { postId, comments: rank(Array.from(byId.values())), packedAuditRead: false };
}

module.exports = { appendThreadComment, rankedThread, threadBase, threadPath, normalizeThreadComment };
