//B"H
/**
 * @module AllPostsIndex
 * @description Chapter 629: all-post bodies now live directly in AwtsmoosDB
 * `allPosts` shard records, while this old filename remains an import bridge.
 */
const { key, put, get, list } = require('../awtsmoosDb/shardStore.js');
function allPostKey({ heichelId, postId }) { return key(['allPosts', heichelId, postId]); }
function postIdOf(post) { return post?.postId || post?.id || ''; }
function compactPost(post) {
  return { postId: postIdOf(post), heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || 'root', aliasId: post.aliasId || post.author || '', type: post.contentType || post.postType || 'post', title: post.title || post.name || '', excerpt: String(post.content || post.description || '').slice(0, 280), connected: true, migratedAt: post.migratedAt || Date.now(), updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now() };
}
function fullAllPost(post) {
  const postId = postIdOf(post);
  const seriesId = post.seriesId || post.parentSeriesId || 'root';
  return { ...post, id: post.id || postId, postId, heichelId: post.heichelId || '', seriesId, parentSeriesId: post.parentSeriesId || seriesId, connected: true, migratedAt: post.migratedAt || Date.now(), _awtsmoosStorage: 'AwtsmoosDB.root.socialShards.allPosts' };
}
function writeAllPost({ post }) {
  const value = fullAllPost(post);
  return put({ shard: 'allPosts', parts: ['allPosts', value.heichelId, value.postId], value, meta: { kind: 'post', storage: 'allPosts', heichelId: value.heichelId, seriesId: value.seriesId, aliasId: value.aliasId || value.author || '' } });
}
function readAllPost({ heichelId, postId }) {
  const record = get({ shard: 'allPosts', parts: ['allPosts', heichelId, postId] });
  return record ? { key: record.key, value: record.value, meta: record.meta } : null;
}
function allPosts({ aliasId = '', heichelId = '', seriesId = '', limit = 500 } = {}) {
  const seen = new Set();
  const output = [];
  const records = list({ shard: 'allPosts', predicate: r => r.meta?.kind === 'post' }).slice().reverse();
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
module.exports = { allPostKey, postIdOf, compactPost, fullAllPost, writeAllPost, readAllPost, allPosts };
