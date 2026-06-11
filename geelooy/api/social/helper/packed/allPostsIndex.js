//B"H
/**
 * @module AllPostsIndex
 * @description
 * Chapter 107: One census file for every connected post.
 *
 * The Awtsmoos gathers only posts that are truly connected to a Heichel and a
 * series index. This module writes and reads the `social.allPosts.awtsdb` shard
 * without touching old DosDB paths, so new readers can be fast while old readers
 * remain safe.
 */

const { logicalKey } = require('./shardPaths.js');
const { writePacked, listPackedRecords, readPacked } = require('./socialPacked.js');

function allPostKey({ heichelId, postId }) {
  return logicalKey(['allPosts', heichelId, postId]);
}

function compactPost(post) {
  return {
    postId: post.postId || post.id,
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

function writeAllPost({ $i, post }) {
  const value = compactPost(post);
  return writePacked({
    $i,
    shard: 'allPosts',
    key: allPostKey(value),
    value,
    meta: { kind: 'allPost', heichelId: value.heichelId, seriesId: value.seriesId, aliasId: value.aliasId }
  });
}

function readAllPost({ $i, heichelId, postId }) {
  return readPacked({ $i, shard: 'allPosts', key: allPostKey({ heichelId, postId }) });
}

function allPosts({ $i, aliasId = '', heichelId = '', seriesId = '', limit = 500 } = {}) {
  const seen = new Set();
  const output = [];
  const records = listPackedRecords({ $i, shard: 'allPosts' });
  for (const record of records.slice().reverse()) {
    const value = record.value || {};
    const key = allPostKey(value);
    if (seen.has(key)) continue;
    if (aliasId && value.aliasId !== aliasId) continue;
    if (heichelId && value.heichelId !== heichelId) continue;
    if (seriesId && value.seriesId !== seriesId) continue;
    seen.add(key);
    output.push(value);
    if (output.length >= limit) break;
  }
  return output;
}

module.exports = { allPostKey, compactPost, writeAllPost, readAllPost, allPosts };
