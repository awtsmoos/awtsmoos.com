//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsQuery
 * @description Grouped listing and filtered all-post queries (split from allPostsIndex.js, verbatim).
 */

	const { allPostKey, postIdOf, readAllPost } = require('./allPostsCore.js');
	const { getFullGrouping, getGroupedEntry } = require('./allPostsGrouped.js');

function allPostsGrouped({ $i, heichelId = '', seriesIds = [] } = {}) {
  const wanted = new Set(seriesIds.map(String));
  const full = getFullGrouping($i, heichelId);
  if (!wanted.size) return full;
  const out = new Map();
  for (const sid of wanted) {
    if (full.has(sid)) out.set(sid, full.get(sid));
  }
  return out;
}

function allPosts({ $i, aliasId = '', heichelId = '', seriesId = '', limit = 500 } = {}) {
  // B"H 2026-10-20 (allPosts-list fix): this used to run an UNCACHED
  // full scan of the whole allPosts shard on EVERY call — journaled as
  // the 'allPosts-list' incident, ~11 calls/min in production, seconds
  // of event-loop block each — because listPackedRecords was re-walked
  // and re-filtered per request. It now selects compact candidates
  // from the grouped build's indexes (series map, alias dimension, or
  // the heichel-ordered list — all produced by the same single pass
  // and stat/generation validated) and point-reads each candidate's
  // latest envelope via readPackedLatest. The value filters below are
  // the original ones, applied to the same latest values in the same
  // newest-first order, so every filtered call pattern (both production
  // callers always pass at least one filter) returns identical results.
  // Only the never-used unfiltered mode differs: a tombstone's empty
  // value no longer surfaces as a stray {} row.
  const entry = getGroupedEntry($i, heichelId);
  let candidates;
  if (seriesId) candidates = entry.groups.get(String(seriesId)) || [];
  else if (aliasId) candidates = entry.byAlias.get(aliasId) || [];
  else candidates = entry.all;
  const seen = new Set();
  const output = [];
  for (const compact of candidates) {
    const envelope = readAllPost({ $i, heichelId: compact.heichelId, postId: compact.postId });
    const value = envelope && envelope.op !== 'del' ? envelope.value : null;
    if (!value) continue;
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (!k || seen.has(k)) continue;
    if (aliasId && (value.aliasId || value.author || '') !== aliasId) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    if (seriesId && value.seriesId !== seriesId && value.parentSeriesId !== seriesId) continue;
    seen.add(k);
    output.push(value);
    if (output.length >= limit) break;
  }
  return output;
}

module.exports = {
	allPosts,
	allPostsGrouped
};
