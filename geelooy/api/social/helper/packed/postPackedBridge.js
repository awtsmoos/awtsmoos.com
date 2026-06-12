//B"H
/**
 * @module PostPackedBridge
 * @description
 * Chapter 17: The new ark spoke first.
 *
 * Migrated live post bodies dwell in `social.allPosts.awtsdb`. This bridge now
 * gives that new vessel priority over the old DosDB echo when both contain the
 * same post id. The Awtsmoos reveals one answer through many garments; the
 * newest garment speaks first, while legacy remains a faithful backup shadow.
 */

const { readPacked, listPackedRecords } = require('./socialPacked.js');
const { allPostKey, postIdOf } = require('./allPostsIndex.js');

/**
 * @description Builds the allPosts key where the living migrated body rests.
 * @param {object} input Named input.
 * @param {string} input.heichelId Heichel id.
 * @param {string} input.postId Post id.
 * @returns {string} Logical allPosts key.
 */
function postKey({ heichelId, postId }) {
  return allPostKey({ heichelId, postId });
}

/**
 * @description Extracts the final path spark from a packed key.
 * @param {string} key Logical key.
 * @returns {string} Post id or empty string.
 */
function postIdFromKey(key) {
  return String(key || '').split('/').filter(Boolean).pop() || '';
}

/**
 * @description Normalizes one allPosts envelope into route post shape.
 * @param {object} input Named input.
 * @param {object} input.record Packed record envelope.
 * @param {string} input.heichelId Heichel id fallback.
 * @returns {object|null} Normalized post or null.
 */
function normalizePackedPost({ record, heichelId }) {
  if (!record || record.op === 'delete' || !record.value) return null;
  const postId = postIdOf(record.value) || postIdFromKey(record.key);
  const seriesId = record.value.seriesId || record.value.parentSeriesId || 'root';
  return {
    id: record.value.id || postId,
    postId,
    heichelId: record.value.heichelId || heichelId,
    seriesId,
    parentSeriesId: record.value.parentSeriesId || seriesId,
    ...record.value,
    _awtsmoosSource: 'allPostsAwtsDB'
  };
}

/**
 * @description Reads a single post from the new allPosts AwtsmoosDB shard.
 * @param {object} input Named input.
 * @returns {object|null} Packed post or null.
 */
function readPackedPost({ $i, heichelId, seriesId = '', postId }) {
  const record = readPacked({ $i, shard: 'allPosts', key: postKey({ heichelId, postId }) });
  const post = normalizePackedPost({ record, heichelId });
  if (!post) return null;
  if (seriesId && seriesId !== 'ALL' && post.seriesId !== seriesId && post.parentSeriesId !== seriesId) return null;
  return post;
}

/**
 * @description Lists latest allPosts records for one heichel and optional series.
 * @param {object} input Named input.
 * @returns {object[]} Packed posts.
 */
function listPackedPosts({ $i, heichelId, seriesId = '' }) {
  const prefix = allPostKey({ heichelId, postId: '' });
  const latest = new Map();
  for (const record of listPackedRecords({ $i, shard: 'allPosts' })) {
    if (!record.key || !record.key.startsWith(prefix)) continue;
    latest.set(record.key, record);
  }
  return Array.from(latest.values())
    .map(record => normalizePackedPost({ record, heichelId }))
    .filter(Boolean)
    .filter(post => !seriesId || seriesId === 'ALL' || post.seriesId === seriesId || post.parentSeriesId === seriesId);
}

/**
 * @description Merges legacy and packed posts with packed/new taking priority.
 * @param {object[]} legacyPosts Old DosDB posts.
 * @param {object[]} packedPosts New allPosts records.
 * @returns {object[]} Merged posts.
 */
function mergePosts(legacyPosts = [], packedPosts = []) {
  const byId = new Map();
  for (const post of legacyPosts) {
    if (!post || !(post.id || post.postId)) continue;
    byId.set(post.id || post.postId, { ...post, _awtsmoosSource: post._awtsmoosSource || 'legacyDosDB' });
  }
  for (const post of packedPosts) {
    if (!post || !(post.id || post.postId)) continue;
    byId.set(post.id || post.postId, post);
  }
  return Array.from(byId.values());
}

/**
 * @description Merges ids from old and new without duplicates.
 * @param {string[]} legacyIds Old ids.
 * @param {object[]} packedPosts Packed posts.
 * @returns {string[]} Stable unique ids.
 */
function mergePostIds(legacyIds = [], packedPosts = []) {
  return Array.from(new Set([...packedPosts.map(post => post.id || post.postId).filter(Boolean).map(String), ...legacyIds.map(String)]));
}

/**
 * @description Filters packed posts by a loose legacy-compatible property match.
 * @param {object} input Named input.
 * @returns {string[]} Matching ids.
 */
function filterPackedPostIds({ posts, propertyKey, propertyValue }) {
  return posts.filter(post => post && post[propertyKey] == propertyValue).map(post => post.id || post.postId).filter(Boolean);
}

module.exports = { postKey, readPackedPost, listPackedPosts, mergePosts, mergePostIds, filterPackedPostIds };
