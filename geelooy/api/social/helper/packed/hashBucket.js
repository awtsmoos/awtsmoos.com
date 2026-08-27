//B"H
/**
 * @module hashBucket
 * @description Stable logical bucket paths. These prevent giant logical folders
 * while still keeping records packed into a few physical shard files.
 */

const crypto = require('crypto');

function stableHash(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex');
}

function bucketParts(value, depth = 2, width = 2) {
  const hash = stableHash(value);
  return Array.from({ length: depth }, (_, index) => hash.slice(index * width, index * width + width));
}

function bucketedKey(kind, id, extra = []) {
  return ['entities', kind, ...bucketParts(id), id, ...extra].filter(Boolean).join('/');
}

module.exports = { stableHash, bucketParts, bucketedKey };
