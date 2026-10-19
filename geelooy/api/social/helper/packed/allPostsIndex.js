//B"H
/**
 * @module AllPostsIndex
 * @description Chapter 645: all-post index operations now pass through the
 * same hybrid packed writer as posts, migrations, and tests. A local `$i` root
 * receives JSONL shards; production without `$i.db.directory` uses AwtsmoosDB.
 */
const fs = require('fs');
const { logicalKey, shardFile, SHARDS } = require('./shardPaths.js');
const { writePacked, readPacked, listPackedRecords, excerptOf, fileRoot } = require('./socialPacked.js');

function allPostKey({ heichelId, postId }) { return logicalKey(['allPosts', heichelId, postId]); }
function postIdOf(post) { return post?.postId || post?.id || ''; }
function compactPost(post) {
  return { postId: postIdOf(post), heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || 'root', aliasId: post.aliasId || post.author || '', type: post.contentType || post.postType || 'post', title: post.title || post.name || '', excerpt: excerptOf(post), connected: true, migratedAt: post.migratedAt || Date.now(), updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now() };
}
function fullAllPost(post) {
  const postId = postIdOf(post);
  const seriesId = post.seriesId || post.parentSeriesId || 'root';
  return { ...post, id: post.id || postId, postId, heichelId: post.heichelId || '', seriesId, parentSeriesId: post.parentSeriesId || seriesId, connected: true, migratedAt: post.migratedAt || Date.now(), _awtsmoosStorage: 'social.allPosts.awtsdb' };
}
function writeAllPost({ $i, post }) {
  const value = fullAllPost(post);
  return writePacked({ $i, shard: 'allPosts', key: allPostKey({ heichelId: value.heichelId, postId: value.postId }), value, meta: { kind: 'post', storage: 'allPosts', heichelId: value.heichelId, seriesId: value.seriesId, aliasId: value.aliasId || value.author || '' } });
}
function readAllPost({ $i, heichelId, postId }) {
  return readPacked({ $i, shard: 'allPosts', key: allPostKey({ heichelId, postId }) });
}
/**
 * B"H 2026-10-12 (api-hardening): single-scan partition of packed posts by
 * series. Series browse pages list children summaries (up to dozens); calling
 * allPosts() per child would re-scan the whole allPosts shard per child.
 * This scans once and groups compact posts by every series identity they
 * claim (seriesId and parentSeriesId), so one pass serves the whole page.
 * Tombstoned (op:'del') records are skipped — a deleted post must not haunt
 * a series listing.
 * @returns {Map<string, Array<object>>} seriesId -> compact posts (newest first)
 */
//B"H 2026-10-19 (series-api-perf): cache the grouped compact-post map by the
//allPosts shard file's mtime+size, so series listing pages cost one stat()
//call on repeat reads instead of re-grouping. Invalidated automatically on
//any append/rewrite.
const groupedCache = new Map(); // cacheKey -> { mtimeMs, size, groups }
function allPostsShardFile($i) {
  try {
    const root = fileRoot($i);
    if (!root || !SHARDS || !SHARDS['allPosts']) return '';
    return shardFile(root, 'allPosts') || '';
  } catch { return ''; }
}
function allPostsGrouped({ $i, heichelId = '', seriesIds = [] } = {}) {
  const wanted = new Set(seriesIds.map(String));
  const cacheKey = 'allPosts|' + heichelId + '|' + [...wanted].sort().join(',');
  const file = allPostsShardFile($i);
  let st = null;
  if (file) { try { st = fs.statSync(file); } catch { st = null; } }
  if (st) {
    const hit = groupedCache.get(cacheKey);
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.groups;
  }
  const groups = buildAllPostsGrouped({ $i, heichelId, wanted });
  if (st) groupedCache.set(cacheKey, { mtimeMs: st.mtimeMs, size: st.size, groups });
  return groups;
}
function buildAllPostsGrouped({ $i, heichelId = '', wanted = new Set() } = {}) {
  const groups = new Map();
  const seen = new Set();
  const records = listPackedRecords({ $i, shard: 'allPosts' }).slice().reverse();
  for (const record of records) {
    if (!record || record.op === 'del') continue;
    const value = record.value || {};
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (!k || seen.has(k)) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    seen.add(k);
    const claimed = new Set(
      [value.seriesId, value.parentSeriesId].map(v => String(v || '')).filter(Boolean)
    );
    if (!claimed.size) claimed.add('root');
    for (const sid of claimed) {
      if (wanted.size && !wanted.has(sid)) continue;
      if (!groups.has(sid)) groups.set(sid, []);
      groups.get(sid).push(compactPost(value));
    }
  }
  return groups;
}
function allPosts({ $i, aliasId = '', heichelId = '', seriesId = '', limit = 500 } = {}) {
  const seen = new Set();
  const output = [];
  const records = listPackedRecords({ $i, shard: 'allPosts' }).slice().reverse();
  for (const record of records) {
    const value = record.value || {};
    const k = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (seen.has(k)) continue;
    if (aliasId && (value.aliasId || value.author || '') !== aliasId) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    if (seriesId && value.seriesId !== seriesId && value.parentSeriesId !== seriesId) continue;
    seen.add(k);
    output.push(value);
    if (output.length >= limit) break;
  }
  return output;
}
module.exports = { allPostKey, postIdOf, compactPost, fullAllPost, writeAllPost, readAllPost, allPosts, allPostsGrouped };
