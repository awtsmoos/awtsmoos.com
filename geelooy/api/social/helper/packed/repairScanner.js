//B"H
/**
 * @module repairScanner
 * @description Lightweight packed integrity scanner and repair helpers.
 */

const { listPackedRecords, writePacked } = require('./socialPacked.js');
const { logicalKey } = require('./shardPaths.js');
const { entityManifestKey, makeEntityManifest } = require('./entityManifest.js');

function postManifestExpectation(post) {
  const id = post?.id || post?.postId;
  if (!id) return null;
  return { kind: 'post', id, expected: entityManifestKey({ kind: 'post', id }), post };
}

function scanPackedIntegrity({ $i }) {
  const core = listPackedRecords({ $i, shard: 'core' });
  const graph = listPackedRecords({ $i, shard: 'graph' });
  const manifestKeys = new Set(core.filter(record => record.meta?.kind === 'entityManifest').map(record => record.key));
  const postRecords = core.filter(record => record.meta?.kind === 'post');
  const missingPostManifests = postRecords
    .map(record => postManifestExpectation(record.value))
    .filter(Boolean)
    .filter(item => !manifestKeys.has(item.expected))
    .map(({ post, ...rest }) => rest);
  const badEdges = graph.filter(record => record.recordType === 'graphEdge').filter(record => !record.value?.from || !record.value?.to);
  return {
    checkedAt: Date.now(),
    coreRecords: core.length,
    graphRecords: graph.length,
    postRecords: postRecords.length,
    missingPostManifests,
    badEdges: badEdges.map(record => record.key),
    ok: missingPostManifests.length === 0 && badEdges.length === 0
  };
}

function repairMissingPostManifests({ $i, limit = 100 }) {
  const core = listPackedRecords({ $i, shard: 'core' });
  const manifestKeys = new Set(core.filter(record => record.meta?.kind === 'entityManifest').map(record => record.key));
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
    const manifest = makeEntityManifest({
      kind: 'post',
      id,
      paths: {
        packedCore: logicalKey(['posts', post.heichelId, id]),
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
    writePacked({ $i, shard: 'core', key: expected.expected, value: manifest, meta: { kind: 'entityManifest', entityKind: 'post', repaired: true } });
    repaired++;
    repairedIds.push(id);
  }
  return { repaired, repairedIds, checked: postRecords.length };
}

module.exports = { scanPackedIntegrity, repairMissingPostManifests };
