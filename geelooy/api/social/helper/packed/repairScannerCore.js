//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module RepairScannerCore
 * @description Core integrity scanning for the packed repair scanner (split from repairScanner.js, verbatim).
 */

	const fs = require('fs');
	const { listPackedRecords, resolveDbRoot } = require('./socialPacked.js');
	const { shardFilesForRead } = require('./shardPaths.js');
	const { entityManifestKey } = require('./entityManifest.js');

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

module.exports = {
	MAX_EXHAUSTIVE_CORE_BYTES,
	boundedCoreIntegrity,
	canScanCoreExhaustively,
	exactCoreIntegrity,
	graphIntegrity,
	manifestKeySet,
	postManifestExpectation,
	scanPackedIntegrity,
	shardBytes
};
