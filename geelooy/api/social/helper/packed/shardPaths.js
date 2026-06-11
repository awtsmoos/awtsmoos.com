//B"H
/**
 * @module SocialPackedShardPaths
 * @description
 * Chapter 105: The Awtsmoos gives every social sidecar its own vessel.
 *
 * Core posts live in `social.core.awtsdb`, all-post indexes live in their own
 * file, and metadata/manifests live apart from content. Legacy `.awtsocial`
 * shards are still recognized as read fallbacks so old packed migrations do
 * not vanish while the new AwtsmoosDB-shaped names take over.
 */

const path = require('path');

const SHARDS = {
  core: 'social.core.awtsdb',
  allPosts: 'social.allPosts.awtsdb',
  meta: 'social.meta.awtsdb',
  graph: 'social.graph.awtsdb',
  notify: 'social.notify.awtsdb',
  audit: 'social.audit.awtsdb',
  search: 'social.search.awtsdb',
  feed: 'social.feed.awtsdb'
};

const LEGACY_SHARDS = {
  core: 'social.core.awtsocial',
  graph: 'social.graph.awtsocial',
  notify: 'social.notify.awtsocial',
  audit: 'social.audit.awtsocial',
  search: 'social.search.awtsocial',
  feed: 'social.feed.awtsocial'
};

function packedRoot(dbRoot) {
  return path.join(dbRoot, 'socialPacked');
}

function shardFile(dbRoot, shard) {
  const file = SHARDS[shard];
  if (!file) throw new Error(`Unknown social packed shard: ${shard}`);
  return path.join(packedRoot(dbRoot), file);
}

function legacyShardFile(dbRoot, shard) {
  const file = LEGACY_SHARDS[shard];
  return file ? path.join(packedRoot(dbRoot), file) : null;
}

function shardFilesForRead(dbRoot, shard) {
  return [legacyShardFile(dbRoot, shard), shardFile(dbRoot, shard)].filter(Boolean);
}

function logicalKey(parts) {
  return '/' + parts.filter(Boolean).map(String).map(part => part.replace(/^\/+|\/+$/g, '')).join('/');
}

module.exports = { SHARDS, LEGACY_SHARDS, packedRoot, shardFile, legacyShardFile, shardFilesForRead, logicalKey };
