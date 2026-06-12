//B"H
/**
 * @module PostPackedBridge
 * @description
 * Chapter 21: The giant ark was read as a river, not swallowed whole.
 *
 * `social.allPosts.awtsdb` can become enormous. The Awtsmoos does not demand
 * that the API inhale the whole sea to find one flame. This bridge streams the
 * JSONL shard in chunks, keeps only matching latest post records, and lets the
 * new allPosts world answer first while old DosDB remains a backup echo.
 */

const fs = require('fs');
const { shardFile } = require('./shardPaths.js');
const { resolveDbRoot } = require('./socialPacked.js');
const { allPostKey, postIdOf } = require('./allPostsIndex.js');

const MAGIC = 'BH_AWTSOCIAL_JSONL_V1';

function postKey({ heichelId, postId }) { return allPostKey({ heichelId, postId }); }
function postIdFromKey(key) { return String(key || '').split('/').filter(Boolean).pop() || ''; }
function allPostsFile($i) { return shardFile(resolveDbRoot($i), 'allPosts'); }

function normalizePackedPost({ record, heichelId }) {
  if (!record || record.op === 'delete' || !record.value) return null;
  const postId = postIdOf(record.value) || postIdFromKey(record.key);
  const seriesId = record.value.seriesId || record.value.parentSeriesId || 'root';
  return { id: record.value.id || postId, postId, heichelId: record.value.heichelId || heichelId, seriesId, parentSeriesId: record.value.parentSeriesId || seriesId, ...record.value, _awtsmoosSource: 'allPostsAwtsDB' };
}

function acceptSeries(post, seriesId) {
  return !seriesId || seriesId === 'ALL' || post.seriesId === seriesId || post.parentSeriesId === seriesId;
}

function parseLine(line) {
  if (!line || line === MAGIC) return null;
  try { return JSON.parse(line); } catch { return null; }
}

function streamShardLines(file, onRecord) {
  if (!fs.existsSync(file)) return;
  const fd = fs.openSync(file, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  let carry = '';
  try {
    while (true) {
      const read = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (!read) break;
      const chunk = carry + buffer.toString('utf8', 0, read);
      const lines = chunk.split('\n');
      carry = lines.pop() || '';
      for (const line of lines) {
        const record = parseLine(line.trimEnd());
        if (record && onRecord(record) === false) return;
      }
    }
    const finalRecord = parseLine(carry.trimEnd());
    if (finalRecord) onRecord(finalRecord);
  } finally {
    fs.closeSync(fd);
  }
}

function latestMatchingPosts({ $i, heichelId, seriesId = '' }) {
  const prefix = `${allPostKey({ heichelId, postId: '' })}/`;
  const latest = new Map();
  streamShardLines(allPostsFile($i), record => {
    if (!record.key || !record.key.startsWith(prefix)) return;
    if (record.op === 'delete') latest.delete(record.key);
    else latest.set(record.key, record);
  });
  return Array.from(latest.values()).map(record => normalizePackedPost({ record, heichelId })).filter(Boolean).filter(post => acceptSeries(post, seriesId));
}

function readPackedPost({ $i, heichelId, seriesId = '', postId }) {
  const key = postKey({ heichelId, postId });
  let latest = null;
  streamShardLines(allPostsFile($i), record => {
    if (record.key !== key) return;
    latest = record.op === 'delete' ? null : record;
  });
  const post = normalizePackedPost({ record: latest, heichelId });
  return post && acceptSeries(post, seriesId) ? post : null;
}

function listPackedPosts({ $i, heichelId, seriesId = '' }) {
  return latestMatchingPosts({ $i, heichelId, seriesId });
}

function mergePosts(legacyPosts = [], packedPosts = []) {
  const byId = new Map();
  for (const post of legacyPosts) if (post?.id || post?.postId) byId.set(post.id || post.postId, { ...post, _awtsmoosSource: post._awtsmoosSource || 'legacyDosDB' });
  for (const post of packedPosts) if (post?.id || post?.postId) byId.set(post.id || post.postId, post);
  return Array.from(byId.values());
}

function mergePostIds(legacyIds = [], packedPosts = []) {
  return Array.from(new Set([...packedPosts.map(post => post.id || post.postId).filter(Boolean).map(String), ...legacyIds.map(String)]));
}

function filterPackedPostIds({ posts, propertyKey, propertyValue }) {
  return posts.filter(post => post && post[propertyKey] == propertyValue).map(post => post.id || post.postId).filter(Boolean);
}

module.exports = { postKey, readPackedPost, listPackedPosts, mergePosts, mergePostIds, filterPackedPostIds };
