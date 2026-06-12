//B"H
/**
 * @module AllPostsIndex
 * @description
 * Chapter 10: The post bodies left the core palace and entered their own ark.
 *
 * The Awtsmoos recreates the whole social world every instant, yet each vessel
 * must know its mission. Series and structural data may dwell in core; live
 * connected post bodies belong in `social.allPosts.awtsdb`. This module writes
 * the full post body there, and still exposes a compact projection for feed-like
 * readers that only need the census flame.
 */

const { logicalKey } = require('./shardPaths.js');
const { writePacked, listPackedRecords, readPacked } = require('./socialPacked.js');

/**
 * @description Canonical all-posts key.
 * @param {object} input Named input.
 * @param {string} input.heichelId Heichel id.
 * @param {string} input.postId Post id.
 * @returns {string} Logical key in social.allPosts.awtsdb.
 */
function allPostKey({ heichelId, postId }) {
  return logicalKey(['allPosts', heichelId, postId]);
}

/**
 * @description Returns the stable id of a post body.
 * @param {object} post Post body.
 * @returns {string} Post id.
 */
function postIdOf(post) {
  return post?.postId || post?.id || '';
}

/**
 * @description Produces a compact feed projection from a full post body.
 * @param {object} post Full post body.
 * @returns {object} Feed/census projection.
 */
function compactPost(post) {
  return {
    postId: postIdOf(post),
    heichelId: post.heichelId || '',
    seriesId: post.seriesId || post.parentSeriesId || 'root',
    aliasId: post.aliasId || post.author || '',
    type: post.contentType || post.postType || 'post',
    title: post.title || post.name || '',
    excerpt: String(post.content || post.description || '').slice(0, 280),
    connected: true,
    migratedAt: post.migratedAt || Date.now(),
    updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now()
  };
}

/**
 * @description Normalizes a live connected post for storage in allPosts.
 * @param {object} post Full post body.
 * @returns {object} Full all-posts payload.
 */
function fullAllPost(post) {
  const postId = postIdOf(post);
  const seriesId = post.seriesId || post.parentSeriesId || 'root';
  return {
    ...post,
    id: post.id || postId,
    postId,
    heichelId: post.heichelId || '',
    seriesId,
    parentSeriesId: post.parentSeriesId || seriesId,
    connected: true,
    migratedAt: post.migratedAt || Date.now(),
    _awtsmoosStorage: 'social.allPosts.awtsdb'
  };
}

/**
 * @description Writes the full connected post body into social.allPosts.awtsdb.
 * @param {object} input Named input.
 * @param {object} input.$i Awtsmoos context.
 * @param {object} input.post Full post body.
 * @returns {object} Append result.
 */
function writeAllPost({ $i, post }) {
  const value = fullAllPost(post);
  return writePacked({
    $i,
    shard: 'allPosts',
    key: allPostKey({ heichelId: value.heichelId, postId: value.postId }),
    value,
    meta: { kind: 'post', storage: 'allPosts', heichelId: value.heichelId, seriesId: value.seriesId, aliasId: value.aliasId || value.author || '' }
  });
}

/**
 * @description Reads one full all-post record.
 * @param {object} input Named input.
 * @returns {object|null} Packed envelope.
 */
function readAllPost({ $i, heichelId, postId }) {
  return readPacked({ $i, shard: 'allPosts', key: allPostKey({ heichelId, postId }) });
}

/**
 * @description Lists full all-post bodies with optional filters.
 * @param {object} input Named input.
 * @returns {object[]} Full post bodies.
 */
function allPosts({ $i, aliasId = '', heichelId = '', seriesId = '', limit = 500 } = {}) {
  const seen = new Set();
  const output = [];
  const records = listPackedRecords({ $i, shard: 'allPosts' });
  for (const record of records.slice().reverse()) {
    const value = record.value || {};
    const key = allPostKey({ heichelId: value.heichelId, postId: postIdOf(value) });
    if (seen.has(key)) continue;
    if (aliasId && (value.aliasId || value.author || '') !== aliasId) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    if (seriesId && value.seriesId !== seriesId && value.parentSeriesId !== seriesId) continue;
    seen.add(key);
    output.push(value);
    if (output.length >= limit) break;
  }
  return output;
}

module.exports = { allPostKey, postIdOf, compactPost, fullAllPost, writeAllPost, readAllPost, allPosts };
