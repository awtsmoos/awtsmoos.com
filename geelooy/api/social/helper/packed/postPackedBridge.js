//B"H
/**
 * @module PostAllPostsBridge
 * @description Chapter 631: post bridge reads AwtsmoosDB allPosts shard directly;
 * no JSONL stream remains.
 */
const { allPostKey, postIdOf, allPosts, readAllPost } = require('./allPostsIndex.js');
function postKey({ heichelId, postId }) { return allPostKey({ heichelId, postId }); }
function normalizePost(value, heichelId) {
  if (!value) return null;
  const postId = postIdOf(value);
  const seriesId = value.seriesId || value.parentSeriesId || 'root';
  return { id: value.id || postId, postId, heichelId: value.heichelId || heichelId, seriesId, parentSeriesId: value.parentSeriesId || seriesId, ...value, _awtsmoosSource: 'allPostsAwtsDB' };
}
function acceptSeries(post, seriesId) { return !seriesId || seriesId === 'ALL' || post.seriesId === seriesId || post.parentSeriesId === seriesId; }
function readPackedPost({ $i, heichelId, seriesId = '', postId }) {
  // B"H 2026-10-20 (allPosts-list fix): the caller's $i vessel is now
  // honored — it used to be dropped, so reads silently landed on the
  // default store instead of the caller's own shard root.
  const record = readAllPost({ $i, heichelId, postId });
  const post = normalizePost(record?.value, heichelId);
  return post && acceptSeries(post, seriesId) ? post : null;
}
function listPackedPosts({ $i, heichelId, seriesId = '' }) {
  // B"H 2026-10-20 (allPosts-list fix): $i forwarded (was dropped, same
  // defect as readPackedPost); the listing itself now rides the grouped
  // compact map + point reads inside allPosts() instead of a full scan.
  return allPosts({ $i, heichelId, seriesId: seriesId === 'ALL' ? '' : seriesId, limit: 10000 }).map(post => normalizePost(post, heichelId)).filter(Boolean).filter(post => acceptSeries(post, seriesId));
}
function mergePosts(legacyPosts = [], dbPosts = []) {
  const byId = new Map();
  for (const post of legacyPosts) if (post?.id || post?.postId) byId.set(post.id || post.postId, { ...post, _awtsmoosSource: post._awtsmoosSource || 'legacyDosDB' });
  for (const post of dbPosts) if (post?.id || post?.postId) byId.set(post.id || post.postId, post);
  return Array.from(byId.values());
}
function mergePostIds(legacyIds = [], dbPosts = []) {
  return Array.from(new Set([...dbPosts.map(post => post.id || post.postId).filter(Boolean).map(String), ...legacyIds.map(String)]));
}
function filterPackedPostIds({ posts, propertyKey, propertyValue }) {
  return posts.filter(post => post && post[propertyKey] == propertyValue).map(post => post.id || post.postId).filter(Boolean);
}
module.exports = { postKey, readPackedPost, listPackedPosts, mergePosts, mergePostIds, filterPackedPostIds };
