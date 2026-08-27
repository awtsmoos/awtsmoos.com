//B"H
/**
 * @module materializedIndexes
 * @description Packed logical indexes for posts and graph edges.
 */

const { logicalKey } = require('./shardPaths.js');
const { writePacked, listPackedRecords } = require('./socialPacked.js');

function indexRecord({ $i, key, value, meta = {} }) {
  return writePacked({ $i, shard: 'search', key, value, meta: { kind: 'materializedIndex', ...meta } });
}

function indexPost({ $i, post }) {
  const postId = post.id || post.postId;
  const heichelId = post.heichelId || '';
  const aliasId = post.aliasId || post.author || '';
  const type = post.contentType || post.postType || 'post';
  const value = { postId, heichelId, aliasId, type, title: post.title || '', updatedAt: Date.now() };
  indexRecord({ $i, key: logicalKey(['indexes', 'postsByHeichel', heichelId, postId]), value, meta: { index: 'postsByHeichel' } });
  if (aliasId) indexRecord({ $i, key: logicalKey(['indexes', 'postsByAlias', aliasId, postId]), value, meta: { index: 'postsByAlias' } });
  indexRecord({ $i, key: logicalKey(['indexes', 'postsByType', type, postId]), value, meta: { index: 'postsByType' } });
  return value;
}

function indexGraphReference({ $i, reference }) {
  const value = { id: reference.id, kind: reference.kind, from: reference.from, to: reference.to, updatedAt: Date.now() };
  indexRecord({ $i, key: logicalKey(['indexes', 'graphOut', reference.from?.type, reference.from?.id, reference.id]), value, meta: { index: 'graphOut', edgeKind: reference.kind } });
  indexRecord({ $i, key: logicalKey(['indexes', 'graphIn', reference.to?.type, reference.to?.id, reference.id]), value, meta: { index: 'graphIn', edgeKind: reference.kind } });
  return value;
}

function indexStats({ $i }) {
  const records = listPackedRecords({ $i, shard: 'search' }).filter(record => record.meta?.kind === 'materializedIndex');
  const byIndex = {};
  for (const record of records) byIndex[record.meta.index] = (byIndex[record.meta.index] || 0) + 1;
  return { records: records.length, byIndex };
}

module.exports = { indexPost, indexGraphReference, indexStats };
