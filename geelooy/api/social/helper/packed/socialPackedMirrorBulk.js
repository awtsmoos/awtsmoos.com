//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked bulk single-post mirror records and writer (split from socialPacked.js).
 */
const { logicalKey } = require('./shardPaths.js');
const { makeEntityManifest, entityManifestKey } = require('./entityManifest.js');
const { engineFor, fileRoot, fileFor } = require('./socialPackedEngine.js');
const { writePacked } = require('./socialPackedCore.js');
const { allPostValue } = require('./socialPackedMirror.js');
/**
 * Bulk-optimized post writer for the import job (Yaakov 2026-10-11:
 * bulk importer is #1 priority — reliable, reusable, fast).
 * Same records as mirrorPost (core, allPosts mirror, entity manifest,
 * search indexes) but WITHOUT the per-post audit event — the import job's
 * own job log (post-import-jobs.log) is the audit trail for bulk runs.
 * Callers yield to the event loop between posts; the JSONL appends here
 * are individually fast.
 */
/**
 * B"H 2026-10-11 (import-speed): the exact shard records mirrorPostBulk
 * writes for one post, as pure data (no I/O). This is the single
 * construction site for both the single-post and the batched mirror
 * writers, so the bytes can never drift between the two paths.
 * Each entry: { shard, key, value, meta } — the writePacked arguments.
 */
function mirrorPostRecords({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const coreKey = logicalKey(['posts', post.heichelId, postId]);
  const allPost = allPostValue(post);
  const manifest = makeEntityManifest({ kind: 'post', id: postId, paths: { core: coreKey, allPosts: logicalKey(['allPosts', post.heichelId, postId]) }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]) }, binaryRefs: { engine: engineFor($i, 'core') }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } });
  const records = [
    { shard: 'core', key: coreKey, value: post, meta: { kind: 'post', type: contentType } },
    { shard: 'allPosts', key: logicalKey(['allPosts', allPost.heichelId, postId]), value: allPost, meta: { kind: 'allPost', aliasId: allPost.aliasId, heichelId: allPost.heichelId, seriesId: allPost.seriesId } },
    { shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: manifest.kind } },
    { shard: 'search', key: logicalKey(['indexes', 'postsByHeichel', allPost.heichelId, postId]), value: allPost, meta: { kind: 'materializedIndex', index: 'postsByHeichel' } },
  ];
  if (allPost.aliasId) {
    records.push({ shard: 'search', key: logicalKey(['indexes', 'postsByAlias', allPost.aliasId, postId]), value: allPost, meta: { kind: 'materializedIndex', index: 'postsByAlias' } });
  }
  records.push({ shard: 'search', key: logicalKey(['indexes', 'postsByType', allPost.type, postId]), value: allPost, meta: { kind: 'materializedIndex', index: 'postsByType' } });
  return records;
}
function mirrorPostBulk({ $i, post }) {
  let first = null;
  const touchedFiles = new Set();
  for (const r of mirrorPostRecords({ $i, post })) {
    const w = writePacked({ $i, shard: r.shard, key: r.key, value: r.value, meta: r.meta });
    if (!first) first = w;
    // BH 2026-10-19: track touched shards for cache invalidation
    try {
      const root = fileRoot($i);
      if (root) {
        const f = fileFor(root, r.shard);
        if (f) touchedFiles.add(f);
      }
    } catch (_) {}
  }
  // B"H 2026-10-20 (flap-fix): the read cache is NO LONGER deleted here.
  // listPackedRecords validates by stat (dev:ino + mtimeMs + size) on
  // every call and tail-merges appends, so written records stay visible
  // immediately WITHOUT forcing the next reader into a full shard
  // re-parse. Deleting the entry per write was the flap trigger.
  // BH 2026-10-19: also clear the grouped posts cache (allPostsIndex.js)
  try {
    const allPostsIndex = require("./allPostsIndex.js");
    if (allPostsIndex.clearGroupedCache) allPostsIndex.clearGroupedCache();
  } catch (_) {}
  // BH 2026-10-19: do NOT delete grouped.json - mergeTailRecords handles append-only growth efficiently
  return first;
}
module.exports = { mirrorPostRecords, mirrorPostBulk };
