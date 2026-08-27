// B"H
/**
 * Chapter 525: Feeds and measures are the mirror; they tell the village where
 * the sparks gathered and how warmly they answered each other.
 */
const p = require('./paths.js');
const { cleanId, cleanLimit } = require('./sanitize.js');
const { idsFromPath, hydrateMany, publicThought, reactionSummary } = require('./read.js');
const { er } = require('../general.js');

async function listThoughts({ $i, entityType, entityId, limit = 80 }) {
  const ids = await idsFromPath($i, p.byEntityPath(cleanId(entityType, 'page'), cleanId(entityId, 'root')));
  return { success: await hydrateMany($i, ids, cleanLimit(limit), { withReactions: true }) };
}

async function threadThought({ $i, thoughtId }) {
  const id = cleanId(thoughtId);
  const thought = await publicThought($i, await $i.db.get(p.byIdPath(id)).catch(() => null), { withReactions: true });
  if (!thought) return er({ code: 'THOUGHT_NOT_FOUND', message: 'Thought not found.' });
  const replies = await hydrateMany($i, await idsFromPath($i, p.repliesPath(id)), 200, { withReactions: true });
  return { success: { ...thought, replies: replies.reverse() } };
}

async function feedThoughts({ $i, aliasId = '', heichelId = '', limit = 80 }) {
  const alias = cleanId(aliasId);
  const heichel = cleanId(heichelId);
  let ids = [];
  if (alias) ids = ids.concat(await idsFromPath($i, p.byAliasPath(alias)));
  if (heichel) ids = ids.concat(await idsFromPath($i, p.byHeichelPath(heichel)));
  if (!alias && !heichel) return er({ code: 'MISSING_FILTER', message: 'aliasId or heichelId is required.' });
  return { success: await hydrateMany($i, ids, cleanLimit(limit), { withReactions: true }) };
}

async function thoughtStats({ $i, entityType, entityId }) {
  const ids = await idsFromPath($i, p.byEntityPath(cleanId(entityType, 'page'), cleanId(entityId, 'root')));
  let replies = 0;
  let reactions = 0;
  for (const id of ids) {
    replies += (await idsFromPath($i, p.repliesPath(id))).length;
    reactions += (await reactionSummary($i, id)).total;
  }
  return { success: { entityType: cleanId(entityType, 'page'), entityId: cleanId(entityId, 'root'), thoughts: ids.length, replies, reactions } };
}

module.exports = { listThoughts, threadThought, feedThoughts, thoughtStats };
