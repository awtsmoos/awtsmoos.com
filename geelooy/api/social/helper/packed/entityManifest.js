//B"H
/**
 * @module entityManifest
 * @description Pure manifest builders. Write operations live in socialPacked
 * to avoid circular dependencies.
 */

const { bucketedKey } = require('./hashBucket.js');
const { logicalKey } = require('./shardPaths.js');

function entityManifestKey({ kind, id }) {
  return logicalKey([bucketedKey(kind, id), 'manifest']);
}

function makeEntityManifest({ kind, id, schemaVersion = 1, paths = {}, indexes = {}, binaryRefs = {}, stats = {}, permissions = {} }) {
  const now = Date.now();
  return { id, kind, version: 1, schemaVersion, createdAt: now, updatedAt: now, paths, indexes, binaryRefs, stats, permissions };
}

module.exports = { entityManifestKey, makeEntityManifest };
