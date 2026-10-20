//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsCore
 * @description Core all-post key/compact/write/read helpers (split from allPostsIndex.js, verbatim).
 */


const { logicalKey, shardFile, SHARDS } = require('./shardPaths.js');
const { writePacked, readPackedLatest, listPackedRecords, excerptOf, effectiveRoot, shardWriteGeneration } = require('./socialPacked.js');

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
  // B"H 2026-10-20 (allPosts-list fix): latest-envelope point read via
  // the facade's stat-validated latest-per-key cache (readPackedLatest)
  // instead of readPacked's per-call full shard scan.
  return readPackedLatest({ $i, shard: 'allPosts', key: allPostKey({ heichelId, postId }) });
}

module.exports = {
	allPostKey,
	compactPost,
	fullAllPost,
	postIdOf,
	readAllPost,
	writeAllPost
};
