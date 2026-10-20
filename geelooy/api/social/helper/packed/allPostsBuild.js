//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsBuild
 * @description Full grouped build for the all-post index (split from allPostsIndex.js, verbatim).
 */

	const { listPackedRecords } = require('./socialPacked.js');
	const { noteFullScan } = require('../safeguards/fullscanWatch.js');
	const { perfEvent } = require('./perfLog.js');
	const { allPostKey, compactPost, postIdOf } = require('./allPostsCore.js');

function buildAllPostsGrouped({ $i, heichelId = '', wanted = new Set() } = {}) {
  noteFullScan('allPostsGrouped-rebuild'); // SAFEGUARDS 2026-10-20: incident
  const buildStart = Date.now();
  const groups = new Map();
  const byAlias = new Map();
  const all = [];
  const seen = new Set();
  const records = listPackedRecords({ $i, shard: 'allPosts' }).slice().reverse();
  for (const record of records) {
    if (!record || record.op === 'del') continue;
    const value = record.value || {};
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (!k || seen.has(k)) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    seen.add(k);
    const compact = compactPost(value);
    all.push(compact);
    const aliasKey = compact.aliasId || '';
    if (!byAlias.has(aliasKey)) byAlias.set(aliasKey, []);
    byAlias.get(aliasKey).push(compact);
    const claimed = new Set(
      [value.seriesId, value.parentSeriesId].map(v => String(v || '')).filter(Boolean)
    );
    if (!claimed.size) claimed.add('root');
    for (const sid of claimed) {
      if (wanted.size && !wanted.has(sid)) continue;
      if (!groups.has(sid)) groups.set(sid, []);
      groups.get(sid).push(compact);
    }
  }
  perfEvent('grouped-build', Date.now() - buildStart, { bytes: all.length });
  return { groups, byAlias, all };
}

module.exports = {
	buildAllPostsGrouped
};
