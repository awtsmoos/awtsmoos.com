//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsViews
 * @description Derived grouped views (ordered list, alias dimension, key index) for the all-post index (split from allPostsIndex.js, verbatim).
 */

	const { allPostKey } = require('./allPostsCore.js');

/** Derives the heichel-ordered list from grouped data (fallback only). */
function deriveAll(groups) {
  const seen = new Set();
  const all = [];
  for (const arr of groups.values()) {
    for (const compact of arr) {
      const k = allPostKey({ heichelId: compact.heichelId, postId: compact.postId });
      if (!k || seen.has(k)) continue;
      seen.add(k);
      all.push(compact);
    }
  }
  return all;
}
/** Builds the alias dimension (aliasId -> compact posts, newest first). */
function rebuildByAlias(all) {
  const byAlias = new Map();
  for (const compact of all || []) {
    const a = compact.aliasId || '';
    if (!byAlias.has(a)) byAlias.set(a, []);
    byAlias.get(a).push(compact);
  }
  return byAlias;
}
/** Fills any missing derived views on a cached entry, in place. */
function normalizeEntry(entry) {
  if (!entry.all) entry.all = deriveAll(entry.groups);
  if (!entry.byAlias) entry.byAlias = rebuildByAlias(entry.all);
  return entry;
}

/** Rebuilds the postKey -> {seriesIds, compact} index from grouped data. */
function rebuildByKey(groups) {
  const byKey = new Map();
  for (const [sid, arr] of groups) {
    for (const compact of arr) {
      const k = allPostKey({ heichelId: compact.heichelId, postId: compact.postId });
      if (!k || byKey.has(k)) continue;
      const e = byKey.get(k);
      if (e) { if (!e.seriesIds.includes(sid)) e.seriesIds.push(sid); }
      else byKey.set(k, { seriesIds: [sid], compact });
    }
  }
  return byKey;
}

module.exports = {
	deriveAll,
	normalizeEntry,
	rebuildByAlias,
	rebuildByKey
};
