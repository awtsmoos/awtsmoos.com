// B"H
/**
 * @module AssetManifest
 * @description Chapter 622: asset manifests now live in AwtsmoosDB metadata
 * shards, while the legacy alias path remains only a readable public mirror.
 */
const { put, get, list, key } = require('../awtsmoosDb/shardStore.js');
function manifestKey(aliasId, assetId) { return key(['assets', aliasId, assetId]); }
async function writeAssetManifest({ $i, manifest }) {
  put({ shard: 'meta', parts: ['assets', manifest.aliasId, manifest.id], value: manifest, meta: { kind: 'assetManifest', aliasId: manifest.aliasId, assetKind: manifest.type } });
  await $i.db.write(`/social/aliases/${manifest.aliasId}/assets/${manifest.id}`, manifest).catch(() => null);
  return manifest;
}
function readAssetManifest({ aliasId, assetId }) {
  return get({ shard: 'meta', parts: ['assets', aliasId, assetId] })?.value || null;
}
async function listAssetManifests({ $i, aliasId }) {
  const records = list({ shard: 'meta', predicate: r => r.meta?.kind === 'assetManifest' && r.value?.aliasId === aliasId }).map(r => r.value);
  if (records.length) return records;
  const legacy = await $i.db.get(`/social/aliases/${aliasId}/assets`).catch(() => null);
  return legacy && typeof legacy === 'object' ? Object.values(legacy) : [];
}
module.exports = { manifestKey, writeAssetManifest, readAssetManifest, listAssetManifests };
