// B"H
/**
 * Chapter 524: A thought is not a stone; it learns, replies, bows, and can
 * be withdrawn without tearing the older API palace.
 */
const p = require('./paths.js');
const { cleanText, cleanId, normalizeInput, thoughtId } = require('./sanitize.js');
const { idsFromPath, hydrateMany, publicThought, reactionSummary } = require('./read.js');
const { er } = require('../general.js');

async function indexRecord($i, r) {
  await $i.db.write(p.byEntityItemPath(r.entityType, r.entityId, r.id), r.id);
  await $i.db.write(p.byAliasItemPath(r.aliasId, r.id), r.id);
  if (r.heichelId) await $i.db.write(p.byHeichelItemPath(r.heichelId, r.id), r.id);
  if (r.parentId) await $i.db.write(p.replyItemPath(r.parentId, r.id), r.id);
}

async function unindexRecord($i, r) {
  await $i.db.delete(p.byEntityItemPath(r.entityType, r.entityId, r.id)).catch(() => null);
  await $i.db.delete(p.byAliasItemPath(r.aliasId, r.id)).catch(() => null);
  if (r.heichelId) await $i.db.delete(p.byHeichelItemPath(r.heichelId, r.id)).catch(() => null);
  if (r.parentId) await $i.db.delete(p.replyItemPath(r.parentId, r.id)).catch(() => null);
}

async function adjustParent($i, parentId, delta) {
  if (!parentId) return;
  const parent = await $i.db.get(p.byIdPath(parentId)).catch(() => null);
  if (!parent || parent.deleted) return;
  const replyCount = Math.max(0, Number(parent.replyCount || 0) + delta);
  await $i.db.write(p.byIdPath(parentId), { ...parent, replyCount, updatedAt: Date.now() });
}

async function createThought({ $i, entityType, entityId, input = {}, parentId = '' }) {
  const base = normalizeInput(input, entityType, entityId);
  if (!base.body) return er({ code: 'MISSING_BODY', message: 'Thought body is required.' });
  const id = cleanId(input.id || thoughtId(parentId ? 'reply' : 'thought'));
  const now = Date.now();
  const record = { id, parentId: cleanId(parentId), ...base, createdAt: now, updatedAt: now, editedAt: 0, replyCount: 0, reactionCount: 0 };
  await $i.db.write(p.byIdPath(id), record);
  await indexRecord($i, record);
  await adjustParent($i, record.parentId, 1);
  return { success: await publicThought($i, record, { withReactions: true }) };
}

async function updateThought({ $i, thoughtId, input = {} }) {
  const id = cleanId(thoughtId);
  const old = await $i.db.get(p.byIdPath(id)).catch(() => null);
  if (!old || old.deleted) return er({ code: 'THOUGHT_NOT_FOUND', message: 'Thought not found.' });
  const body = cleanText(input.body || input.text || input.content || old.body, 2000);
  if (!body) return er({ code: 'MISSING_BODY', message: 'Thought body is required.' });
  const next = { ...old, body, context: input.context ? require('./sanitize.js').parseJson(input.context) : old.context, editedAt: Date.now(), updatedAt: Date.now() };
  await $i.db.write(p.byIdPath(id), next);
  return { success: await publicThought($i, next, { withReactions: true }) };
}

async function deleteThought({ $i, thoughtId, recursive = false }) {
  const id = cleanId(thoughtId);
  const record = await $i.db.get(p.byIdPath(id)).catch(() => null);
  if (!record || record.deleted) return er({ code: 'THOUGHT_NOT_FOUND', message: 'Thought not found.' });
  let children = [];
  if (recursive) {
    for (const childId of await idsFromPath($i, p.repliesPath(id))) {
      const child = await deleteThought({ $i, thoughtId: childId, recursive: true });
      if (child.success) children = children.concat(child.success.deleted, child.success.children || []);
    }
  }
  await unindexRecord($i, record);
  await $i.db.delete(p.byIdPath(id));
  await $i.db.delete(p.repliesPath(id)).catch(() => null);
  await $i.db.delete(p.reactionsPath(id)).catch(() => null);
  await adjustParent($i, record.parentId, -1);
  return { success: { deleted: id, children } };
}

module.exports = { createThought, updateThought, deleteThought };
