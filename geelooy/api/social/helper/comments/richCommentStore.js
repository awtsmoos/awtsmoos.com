// B"H
/**
 * @module RichCommentStore
 * @description
 * Chapter 179: The immense comment tree breathes for every entity. Comments can
 * contain their own sections, and replies may target the whole comment or a
 * single inner section while media/links remain attached at every layer.
 */

const { er } = require('../general.js');
const { verifyAliasOwnership } = require('../alias.js');
const { normalizeCommentBody, uniqueCommentUrl } = require('./richCommentSchema.js');
const paths = require('./richCommentPaths.js');

function id(aliasId) { return `c_${Date.now()}_${aliasId}_${Math.random().toString(36).slice(2)}`; }
function arr(value) { return Array.isArray(value) ? value : []; }
async function read($i, path, fallback = null) { try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; } }
async function writeIndex($i, path, value) { const list = arr(await read($i, path, [])); if (!list.includes(value)) list.push(value); await $i.db.write(path, list); }
async function removeIndex($i, path, value) { await $i.db.write(path, arr(await read($i, path, [])).filter(item => item !== value)); }

async function ensureOwner({ $i, aliasId, userid }) {
  $i.$_GET = $i.$_GET || {};
  $i.$_POST = $i.$_POST || {};
  $i.request = $i.request || { headers: {} };
  const ok = await verifyAliasOwnership(aliasId, $i, userid);
  return ok ? null : er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required for comment action.' });
}

function contextFrom({ heichelId, postId, seriesId = 'root', commentId, verseSection, subsectionId }) { return { heichelId, postId, seriesId, commentId, verseSection, subsectionId }; }
function hasBody(body) { return body.content || body.audioNoteText || body.assets.length || body.links.length || body.sections.length; }

async function getComment({ $i, heichelId, postId, commentId }) {
  const comment = await read($i, paths.commentPath(contextFrom({ heichelId, postId, commentId })), null);
  return comment ? { success: comment } : er({ code: 'COMMENT_NOT_FOUND', message: 'Comment not found.' });
}

async function getCommentByUnique({ $i, commentId }) {
  const pointer = await read($i, paths.uniquePath({ commentId }), null);
  if (!pointer) return er({ code: 'COMMENT_NOT_FOUND', message: 'Comment URL not found.' });
  return await getComment({ $i, ...pointer, commentId });
}

async function createComment({ $i, userid, heichelId, postId, seriesId = 'root', parentId = '', parentSectionId = '', aliasId }) {
  aliasId = aliasId || $i.$_POST?.aliasId;
  parentSectionId = parentSectionId || $i.$_POST?.parentSectionId || $i.$_POST?.replyToSectionId || '';
  const blocked = await ensureOwner({ $i, aliasId, userid });
  if (blocked) return blocked;
  const body = normalizeCommentBody($i.$_POST || {});
  if (!hasBody(body)) return er({ code: 'EMPTY_COMMENT', message: 'Text, audio note, asset, link, or section is required.' });
  const commentId = id(aliasId);
  const comment = { id: commentId, heichelId, postId, entityId: postId, seriesId, parentId, parentSectionId, parentType: parentId ? (parentSectionId ? 'commentSection' : 'comment') : 'entity', aliasId, author: aliasId, ...body, url: '', createdAt: Date.now(), updatedAt: Date.now(), deleted: false };
  comment.url = uniqueCommentUrl(comment);
  const context = contextFrom({ heichelId, postId, seriesId, commentId, verseSection: comment.verseSection, subsectionId: comment.subsectionId });
  await $i.db.write(paths.commentPath(context), comment);
  await $i.db.write(paths.uniquePath({ commentId }), { heichelId, postId, seriesId });
  await writeIndex($i, parentId ? paths.childIndexPath(contextFrom({ heichelId, postId, commentId: parentId })) : paths.rootChildrenPath(context), commentId);
  await writeIndex($i, paths.verseIndexPath(context), commentId);
  if (comment.subsectionId) await writeIndex($i, paths.subsectionIndexPath(context), commentId);
  return { success: comment };
}

async function childrenOf({ $i, heichelId, postId, commentId, includeDeleted = false }) {
  const childIds = arr(await read($i, paths.childIndexPath(contextFrom({ heichelId, postId, commentId })), []));
  const children = [];
  for (const id of childIds) {
    const got = await getComment({ $i, heichelId, postId, commentId: id });
    if (got.success && (includeDeleted || !got.success.deleted)) children.push(await withChildren({ $i, comment: got.success, includeDeleted }));
  }
  return children;
}

async function withChildren({ $i, comment, includeDeleted = false }) { return { ...comment, replies: await childrenOf({ $i, heichelId: comment.heichelId, postId: comment.postId, commentId: comment.id, includeDeleted }) }; }

async function getTree({ $i, heichelId, postId, verseSection = '', subsectionId = '', includeDeleted = false }) {
  const rootIds = arr(await read($i, paths.rootChildrenPath(contextFrom({ heichelId, postId })), []));
  const out = [];
  for (const id of rootIds) {
    const got = await getComment({ $i, heichelId, postId, commentId: id });
    if (!got.success || (!includeDeleted && got.success.deleted)) continue;
    if (verseSection && got.success.verseSection !== verseSection) continue;
    if (subsectionId && got.success.subsectionId !== subsectionId) continue;
    out.push(await withChildren({ $i, comment: got.success, includeDeleted }));
  }
  return { success: out };
}

async function countRecursive({ $i, heichelId, postId, commentId }) {
  let count = 1;
  for (const childId of arr(await read($i, paths.childIndexPath(contextFrom({ heichelId, postId, commentId })), []))) count += await countRecursive({ $i, heichelId, postId, commentId: childId });
  return count;
}

async function previewVerseDelete({ $i, heichelId, postId, verseSection }) {
  const ids = arr(await read($i, paths.verseIndexPath(contextFrom({ heichelId, postId, verseSection })), []));
  let count = 0;
  for (const commentId of ids) count += await countRecursive({ $i, heichelId, postId, commentId });
  return { success: { verseSection, rootComments: ids.length, totalComments: count, requiresConfirmation: count > 0 } };
}

async function previewSubsectionDelete({ $i, heichelId, postId, subsectionId }) {
  const ids = arr(await read($i, paths.subsectionIndexPath(contextFrom({ heichelId, postId, subsectionId })), []));
  let count = 0;
  for (const commentId of ids) count += await countRecursive({ $i, heichelId, postId, commentId });
  return { success: { subsectionId, rootComments: ids.length, totalComments: count, requiresConfirmation: count > 0 } };
}

async function deleteOne({ $i, heichelId, postId, commentId, reason = 'deleted' }) {
  const got = await getComment({ $i, heichelId, postId, commentId });
  if (!got.success) return { deleted: 0, missing: [commentId] };
  const comment = got.success;
  let count = comment.deleted ? 0 : 1;
  for (const childId of arr(await read($i, paths.childIndexPath(contextFrom({ heichelId, postId, commentId })), []))) count += (await deleteOne({ $i, heichelId, postId, commentId: childId, reason })).deleted;
  const tombstone = { ...comment, deleted: true, deletedAt: Date.now(), deleteReason: reason, content: '', audioNoteText: '', assets: [], sections: [], links: [], previews: [] };
  await $i.db.write(paths.commentPath(contextFrom({ heichelId, postId, commentId })), tombstone);
  await removeIndex($i, paths.verseIndexPath(contextFrom({ heichelId, postId, verseSection: comment.verseSection })), commentId);
  if (comment.subsectionId) await removeIndex($i, paths.subsectionIndexPath(contextFrom({ heichelId, postId, subsectionId: comment.subsectionId })), commentId);
  return { deleted: count, missing: [] };
}

async function deleteVerseComments({ $i, heichelId, postId, verseSection }) {
  const list = arr(await read($i, paths.verseIndexPath(contextFrom({ heichelId, postId, verseSection })), []));
  let deleted = 0;
  for (const commentId of [...list]) deleted += (await deleteOne({ $i, heichelId, postId, commentId, reason: `verse:${verseSection}` })).deleted;
  await $i.db.write(paths.verseIndexPath(contextFrom({ heichelId, postId, verseSection })), []);
  return { success: { verseSection, deleted } };
}

async function deleteSubsectionComments({ $i, heichelId, postId, subsectionId }) {
  const list = arr(await read($i, paths.subsectionIndexPath(contextFrom({ heichelId, postId, subsectionId })), []));
  let deleted = 0;
  for (const commentId of [...list]) deleted += (await deleteOne({ $i, heichelId, postId, commentId, reason: `subsection:${subsectionId}` })).deleted;
  await $i.db.write(paths.subsectionIndexPath(contextFrom({ heichelId, postId, subsectionId })), []);
  return { success: { subsectionId, deleted } };
}

module.exports = { createComment, getTree, getComment, getCommentByUnique, deleteOne, deleteVerseComments, deleteSubsectionComments, previewVerseDelete, previewSubsectionDelete };
