// B"H
/**
 * Chapter 529: Some stores first reveal the child name, not the child body.
 * So the reader descends one more rung and resurrects the true reaction.
 */
const { byIdPath, reactionsPath, reactionAliasPath } = require('./paths.js');
const { cleanLimit } = require('./sanitize.js');

async function readChildren($i, path) {
  const raw = await $i.db.get(path).catch(() => null);
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') return Object.values(raw);
  return [];
}

async function idsFromPath($i, path) {
  const values = await readChildren($i, path);
  return values.map(value => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return value.id || value.thoughtId || value.aliasId || '';
    return '';
  }).filter(Boolean);
}

async function hydrateReaction($i, thoughtId, value) {
  if (value && typeof value === 'object' && value.kind) return value;
  const alias = typeof value === 'string' ? value : value?.aliasId;
  if (!alias) return null;
  const row = await $i.db.get(reactionAliasPath(thoughtId, alias)).catch(() => null);
  if (row && typeof row === 'object') return row;
  return null;
}

async function reactionSummary($i, id) {
  const rawRows = await readChildren($i, reactionsPath(id));
  const rows = [];
  for (const raw of rawRows) {
    const hydrated = await hydrateReaction($i, id, raw);
    if (hydrated) rows.push(hydrated);
  }
  const summary = {};
  for (const row of rows) {
    const kind = row && row.kind ? row.kind : '';
    if (kind) summary[kind] = (summary[kind] || 0) + 1;
  }
  return { total: rows.length, kinds: summary, reactions: rows };
}

async function publicThought($i, record, options = {}) {
  if (!record || record.deleted) return null;
  const reactions = options.withReactions ? await reactionSummary($i, record.id) : undefined;
  return {
    id: record.id, parentId: record.parentId || '', entityType: record.entityType, entityId: record.entityId,
    aliasId: record.aliasId, heichelId: record.heichelId || '', seriesId: record.seriesId || '', postId: record.postId || '',
    body: record.body, context: record.context || {}, createdAt: record.createdAt, updatedAt: record.updatedAt,
    editedAt: record.editedAt || 0, replyCount: record.replyCount || 0,
    reactionCount: reactions?.total || record.reactionCount || 0, reactions: reactions ? reactions.kinds : undefined
  };
}

async function hydrateMany($i, ids, limit = 80, options = {}) {
  const list = [];
  for (const id of [...new Set(ids)].slice(0, cleanLimit(limit))) {
    const pub = await publicThought($i, await $i.db.get(byIdPath(id)).catch(() => null), options);
    if (pub) list.push(pub);
  }
  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

module.exports = { readChildren, idsFromPath, reactionSummary, publicThought, hydrateMany };
