//B"H
/**
 * @module PostPackedBridge
 * @description
 * Chapter 1: Two rivers entered the heichel at dawn.
 *
 * One river was old DosDB stone: paths, keys, series, posts, the bruised
 * memory of every word already spoken. One river was AwtsmoosDB fire:
 * `social.core.awtsdb`, where migrated posts glow as append-only sparks.
 *
 * This bridge does not erase either river. It listens to both. The Awtsmoos,
 * beyond body and form, recreates every byte from nothing every instant; this
 * module follows that discipline by reading legacy and packed records together
 * before the API answers.
 */

const { readPacked, listPackedRecords } = require('./socialPacked.js');
const { logicalKey } = require('./shardPaths.js');

/**
 * @description Builds the canonical packed key for one post.
 * @param {object} input Named input.
 * @param {string} input.heichelId Heichel id.
 * @param {string} input.postId Post id.
 * @returns {string} Logical AwtsmoosDB key.
 */
function postKey({ heichelId, postId }) {
  return logicalKey(['posts', heichelId, postId]);
}

/**
 * @description Extracts the id at the end of a packed post key.
 * @param {string} key Packed logical key.
 * @returns {string} Post id or empty string.
 */
function postIdFromKey(key) {
  return String(key || '').split('/').filter(Boolean).pop() || '';
}

/**
 * @description Normalizes one packed record into the normal post object shape.
 * @param {object} input Named input.
 * @param {object} input.record Packed record envelope.
 * @param {string} input.heichelId Heichel id.
 * @returns {object|null} Normalized post or null.
 */
function normalizePackedPost({ record, heichelId }) {
  if (!record || record.op === 'delete' || !record.value) return null;
  const postId = record.value.id || record.value.postId || postIdFromKey(record.key);
  const seriesId = record.value.seriesId || record.value.parentSeriesId || 'root';
  return {
    id: postId,
    postId,
    heichelId: record.value.heichelId || heichelId,
    seriesId,
    parentSeriesId: record.value.parentSeriesId || seriesId,
    ...record.value,
    _awtsmoosSource: 'packedAwtsDB'
  };
}

/**
 * @description Reads a single post from AwtsmoosDB packed storage.
 * @param {object} input Named input.
 * @param {object} input.$i Awtsmoos request context.
 * @param {string} input.heichelId Heichel id.
 * @param {string} input.seriesId Optional series id filter.
 * @param {string} input.postId Post id.
 * @returns {object|null} Packed post or null.
 */
function readPackedPost({ $i, heichelId, seriesId = '', postId }) {
  const record = readPacked({ $i, shard: 'core', key: postKey({ heichelId, postId }) });
  const post = normalizePackedPost({ record, heichelId });
  if (!post) return null;
  if (seriesId && seriesId !== 'ALL' && post.seriesId !== seriesId && post.parentSeriesId !== seriesId) return null;
  return post;
}

/**
 * @description Lists latest packed posts for one heichel and optional series.
 * @param {object} input Named input.
 * @param {object} input.$i Awtsmoos request context.
 * @param {string} input.heichelId Heichel id.
 * @param {string} input.seriesId Optional series id filter.
 * @returns {object[]} Packed posts.
 */
function listPackedPosts({ $i, heichelId, seriesId = '' }) {
  const prefix = logicalKey(['posts', heichelId]) + '/';
  const latest = new Map();
  for (const record of listPackedRecords({ $i, shard: 'core' })) {
    if (!record.key || !record.key.startsWith(prefix)) continue;
    latest.set(record.key, record);
  }
  return Array.from(latest.values())
    .map(record => normalizePackedPost({ record, heichelId }))
    .filter(Boolean)
    .filter(post => !seriesId || seriesId === 'ALL' || post.seriesId === seriesId || post.parentSeriesId === seriesId);
}

/**
 * @description Merges old post objects with packed post objects without dupes.
 * Legacy wins on duplicate ids because live writes still target the legacy tree.
 * @param {object[]} legacyPosts Posts read from the old DB path.
 * @param {object[]} packedPosts Posts read from AwtsmoosDB.
 * @returns {object[]} Merged posts.
 */
function mergePosts(legacyPosts = [], packedPosts = []) {
  const byId = new Map();
  for (const post of packedPosts) if (post?.id || post?.postId) byId.set(post.id || post.postId, post);
  for (const post of legacyPosts) {
    if (!post || !(post.id || post.postId)) continue;
    byId.set(post.id || post.postId, { ...post, _awtsmoosSource: post._awtsmoosSource || 'legacyDosDB' });
  }
  return Array.from(byId.values());
}

/**
 * @description Merges legacy ids with packed ids.
 * @param {string[]} legacyIds Old ids.
 * @param {object[]} packedPosts Packed post objects.
 * @returns {string[]} Stable unique ids.
 */
function mergePostIds(legacyIds = [], packedPosts = []) {
  return Array.from(new Set([...legacyIds.map(String), ...packedPosts.map(post => post.id || post.postId).filter(Boolean).map(String)]));
}

/**
 * @description Filters packed posts by property with loose legacy-compatible equality.
 * @param {object} input Named input.
 * @param {object[]} input.posts Posts.
 * @param {string} input.propertyKey Property key.
 * @param {string} input.propertyValue Property value.
 * @returns {string[]} Matching ids.
 */
function filterPackedPostIds({ posts, propertyKey, propertyValue }) {
  return posts.filter(post => post && post[propertyKey] == propertyValue).map(post => post.id || post.postId).filter(Boolean);
}

module.exports = { postKey, readPackedPost, listPackedPosts, mergePosts, mergePostIds, filterPackedPostIds };
