//B"H
/**
 * @module shardPaths
 * @description Logical shard layout for packed social sidecars.
 */

const path = require('path');

const SHARDS = {
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

function logicalKey(parts) {
  return '/' + parts.filter(Boolean).map(String).map(part => part.replace(/^\/+|\/+$/g, '')).join('/');
}

module.exports = { SHARDS, packedRoot, shardFile, logicalKey };
