//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module RepairScannerRepair
 * @description Missing post-manifest repair for the packed repair scanner (split from repairScanner.js, verbatim).
 */

	const { listPackedRecords, writePacked } = require('./socialPacked.js');
	const { logicalKey } = require('./shardPaths.js');
	const { makeEntityManifest } = require('./entityManifest.js');
	const { canScanCoreExhaustively, manifestKeySet, postManifestExpectation, shardBytes } = require('./repairScannerCore.js');

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

module.exports = {
	makeRepairManifest,
	repairMissingPostManifests
};
