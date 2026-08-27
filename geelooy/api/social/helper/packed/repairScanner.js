//B"H
/**
 * @module repairScanner
 * @description
 * Small shards are scanned exactly; huge live core shards are bounded so
 * integrity and repair routes do not hang or reset the HTTP server.
 */

const fs = require('fs');
const { listPackedRecords, writePacked, resolveDbRoot } = require('./socialPacked.js');
const { logicalKey, shardFilesForRead } = require('./shardPaths.js');
const { entityManifestKey, makeEntityManifest } = require('./entityManifest.js');

const MAX_EXHAUSTIVE_CORE_BYTES = 5 * 1024 * 1024;

function postManifestExpectation(post) {
  const id = post?.id || post?.postId;
  if (!id) return null;
  return { kind: 'post', id, expected: entityManifestKey({ kind: 'post', id }), post };
}

function fileSize(file) {
  try { return fs.statSync(file).size; } catch { return 0; }
}

function shardBytes({ $i, shard }) {
  const dbRoot = resolveDbRoot($i);
  return shardFilesForRead(dbRoot, shard).reduce((sum, file) => sum + fileSize(file), 0);
}

function canScanCoreExhaustively({ $i }) {
  return shardBytes({ $i, shard: 'core' }) <= MAX_EXHAUSTIVE_CORE_BYTES;
}

function manifestKeySet({ $i }) {
  return new Set(listPackedRecords({ $i, shard: 'meta' })
    .filter(record => record.meta?.kind === 'entityManifest')
    .map(record => record.key));
}

function graphIntegrity({ $i }) {
  const graph = listPackedRecords({ $i, shard: 'graph' });
  const badEdges = graph.filter(record => record.recordType === 'graphEdge').filter(record => !record.value?.from || !record.value?.to);
  return { graphRecords: graph.length, badEdges: badEdges.map(record => record.key) };
}

function exactCoreIntegrity({ $i, manifestKeys }) {
  const core = listPackedRecords({ $i, shard: 'core' });
  const postRecords = core.filter(record => record.meta?.kind === 'post');
  const missingPostManifests = postRecords
    .map(record => postManifestExpectation(record.value))
    .filter(Boolean)
    .filter(item => !manifestKeys.has(item.expected))
    .map(({ post, ...rest }) => rest);
  return { coreRecords: core.length, postRecords: postRecords.length, missingPostManifests, exhaustiveCoreScan: true };
}

function boundedCoreIntegrity({ $i }) {
  return {
    coreRecords: null,
    postRecords: null,
    missingPostManifests: [],
    exhaustiveCoreScan: false,
    skippedReason: 'core_shard_too_large_for_request_integrity_scan',
    coreBytes: shardBytes({ $i, shard: 'core' })
  };
}

function scanPackedIntegrity({ $i }) {
  const manifestKeys = manifestKeySet({ $i });
  const graph = graphIntegrity({ $i });
  const core = canScanCoreExhaustively({ $i }) ? exactCoreIntegrity({ $i, manifestKeys }) : boundedCoreIntegrity({ $i });
  return {
    checkedAt: Date.now(),
    ...core,
    graphRecords: graph.graphRecords,
    badEdges: graph.badEdges,
    approximate: !core.exhaustiveCoreScan,
    ok: core.missingPostManifests.length === 0 && graph.badEdges.length === 0
  };
}

function makeRepairManifest(post, id, contentType) {
  return makeEntityManifest({
    kind: 'post',
    id,
    paths: {
      packedCore: logicalKey(['posts', post.heichelId, id]),
      allPosts: logicalKey(['allPosts', post.heichelId, id]),
      legacy: post.parentSeriesId || post.seriesId ? `/social/heichelos/${post.heichelId}/series/${post.parentSeriesId || post.seriesId}/posts/${id}` : ''
    },
    indexes: {
      byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, id]),
      byAlias: post.aliasId ? logicalKey(['indexes', 'postsByAlias', post.aliasId, id]) : '',
      byType: logicalKey(['indexes', 'postsByType', contentType, id])
    },
    binaryRefs: { futureShard: 'social.core.awtsdb' },
    stats: { repaired: true, sections: Array.isArray(post.sections) ? post.sections.length : 0 }
  });
}

function repairMissingPostManifests({ $i, limit = 100 }) {
  if (!canScanCoreExhaustively({ $i })) {
    return { repaired: 0, repairedIds: [], checked: 0, approximate: true, skippedReason: 'core_shard_too_large_for_request_repair_scan', coreBytes: shardBytes({ $i, shard: 'core' }) };
  }
  const core = listPackedRecords({ $i, shard: 'core' });
  const manifestKeys = manifestKeySet({ $i });
  const postRecords = core.filter(record => record.meta?.kind === 'post');
  let repaired = 0;
  const repairedIds = [];
  for (const record of postRecords) {
    if (repaired >= limit) break;
    const expected = postManifestExpectation(record.value);
    if (!expected || manifestKeys.has(expected.expected)) continue;
    const post = expected.post;
    const id = post.id || post.postId;
    const contentType = post.contentType || post.postType || 'post';
    writePacked({ $i, shard: 'meta', key: expected.expected, value: makeRepairManifest(post, id, contentType), meta: { kind: 'entityManifest', entityKind: 'post', repaired: true } });
    manifestKeys.add(expected.expected);
    repaired++;
    repairedIds.push(id);
  }
  return { repaired, repairedIds, checked: postRecords.length, approximate: false };
}

module.exports = { scanPackedIntegrity, repairMissingPostManifests, canScanCoreExhaustively };
