// B"H
/**
 * Chapter 526: Reaction is a tiny crown placed on another spark, counted
 * without drowning the original whisper.
 */
const p = require('./paths.js');
const { cleanId, cleanText } = require('./sanitize.js');
const { reactionSummary } = require('./read.js');
const { er } = require('../general.js');

async function setReaction({ $i, thoughtId, input = {} }) {
  const id = cleanId(thoughtId);
  const record = await $i.db.get(p.byIdPath(id)).catch(() => null);
  if (!record || record.deleted) return er({ code: 'THOUGHT_NOT_FOUND', message: 'Thought not found.' });
  const aliasId = cleanId(input.aliasId || input.actorAliasId || input.authorAliasId);
  if (!aliasId) return er({ code: 'MISSING_ALIAS', message: 'aliasId is required.' });
  const kind = cleanText(input.kind || input.reaction || 'like', 40) || 'like';
  const row = { aliasId, kind, updatedAt: Date.now() };
  await $i.db.write(p.reactionAliasPath(id, aliasId), row);
  const summary = await reactionSummary($i, id);
  await $i.db.write(p.byIdPath(id), { ...record, reactionCount: summary.total, updatedAt: Date.now() });
  return { success: { thoughtId: id, ...summary } };
}

async function getReactions({ $i, thoughtId }) {
  const id = cleanId(thoughtId);
  const record = await $i.db.get(p.byIdPath(id)).catch(() => null);
  if (!record || record.deleted) return er({ code: 'THOUGHT_NOT_FOUND', message: 'Thought not found.' });
  const summary = await reactionSummary($i, id);
  return { success: { thoughtId: id, ...summary } };
}

module.exports = { setReaction, getReactions };
