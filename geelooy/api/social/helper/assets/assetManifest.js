// B"H
/**
 * @module AssetManifest
 * @description
 * Chapter 118: Each uploaded binary gets a public manifest in metadata and a
 * legacy alias index so both old and new readers can find it.
 */

const { logicalKey } = require('../packed/shardPaths.js');
const { writePacked, readPacked, listPackedRecords } = require('../packed/socialPacked.js');

function manifestKey(aliasId, assetId) {
  return logicalKey(['assets', aliasId, assetId]);
}

async function writeAssetManifest({ $i, manifest }) {
  await writePacked({ $i, shard: 'meta', key: manifestKey(manifest.aliasId, manifest.id), value: manifest, meta: { kind: 'assetManifest', aliasId: manifest.aliasId, assetKind: manifest.type } });
  await $i.db.write(`/social/aliases/${manifest.aliasId}/assets/${manifest.id}`, manifest).catch(() => null);
  return manifest;
}

function readAssetManifest({ $i, aliasId, assetId }) {
  const record = readPacked({ $i, shard: 'meta', key: manifestKey(aliasId, assetId) });
  return record?.value || null;
}

async function listAssetManifests({ $i, aliasId }) {
  const packed = listPackedRecords({ $i, shard: 'meta' }).map(record => record.value).filter(value => value?.aliasId === aliasId && value?.id && value?.storagePath);
  if (packed.length) return packed;
  const legacy = await $i.db.get(`/social/aliases/${aliasId}/assets`).catch(() => null);
  return legacy && typeof legacy === 'object' ? Object.values(legacy) : [];
}

module.exports = { manifestKey, writeAssetManifest, readAssetManifest, listAssetManifests };
