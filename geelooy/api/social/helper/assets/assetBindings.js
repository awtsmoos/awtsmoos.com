// B"H
/**
 * @module AssetBindings
 * @description
 * Chapter 181: Assets live in a separate alias vault, but can illuminate root
 * posts, verses, subsections, comment roots, comment sections, series cards,
 * Heichel cards, and navigation covers. The manifest also records Awtsmoos OS
 * and virtual-OS style paths so the file-system UI can treat assets as vessels.
 */

const { er } = require('../general.js');
const { readAssetManifest, writeAssetManifest } = require('./assetManifest.js');
const { writeEntity, getEntity } = require('../entityUniverse/universeStore.js');

function clean(value, max = 200) { return String(value || '').replace(/[<>]/g, '').trim().slice(0, max); }
function bindingId(target) { return [target.kind, target.heichelId, target.seriesId, target.entityType, target.entityId, target.nodeId, target.commentId, target.commentSectionId].filter(Boolean).join('__'); }
function osPaths(aliasId, assetId) { return { ownerOsPath: `/os/aliases/${aliasId}/assets/${assetId}`, virtualOsPath: `/awtsmoos-os/assets/${aliasId}/${assetId}`, vaultPath: `/socialAssets/aliases/${aliasId}/${assetId}` }; }

async function bindAsset({ $i, aliasId, assetId, target = {}, role = 'inline' }) {
  const manifest = readAssetManifest({ $i, aliasId, assetId });
  if (!manifest) return er({ code: 'ASSET_NOT_FOUND', message: 'Asset manifest not found.' });
  const binding = { id: bindingId(target), role: clean(role, 40), target: normalizeTarget(target), boundAt: Date.now() };
  const updated = { ...manifest, ...osPaths(aliasId, assetId), bindings: [...(manifest.bindings || []).filter(item => item.id !== binding.id), binding] };
  await writeAssetManifest({ $i, manifest: updated });
  await mirrorVisualTarget({ $i, manifest: updated, binding });
  return { success: updated };
}

function normalizeTarget(target = {}) {
  return { kind: clean(target.kind || 'entity', 40), heichelId: clean(target.heichelId, 120), seriesId: clean(target.seriesId, 120), entityType: clean(target.entityType || target.type || 'post', 80), entityId: clean(target.entityId || target.postId || target.id, 120), nodeId: clean(target.nodeId || target.verseSection || target.subsectionId, 120), commentId: clean(target.commentId, 140), commentSectionId: clean(target.commentSectionId || target.sectionId, 120) };
}

async function mirrorVisualTarget({ $i, manifest, binding }) {
  if (!['cover', 'hero', 'navigationImage', 'mainPicture'].includes(binding.role)) return;
  const target = binding.target;
  if (target.kind === 'heichel' && target.heichelId) await $i.db.write(`/social/heichelos/${target.heichelId}/visual`, { featuredAsset: manifest, updatedAt: Date.now() });
  if (target.kind === 'series' && target.heichelId && target.seriesId) await $i.db.write(`/social/heichelos/${target.heichelId}/series/${target.seriesId}/visual`, { featuredAsset: manifest, updatedAt: Date.now() });
  if (target.entityId) {
    const got = await getEntity({ $i, type: target.entityType || 'post', id: target.entityId });
    if (got.success) await writeEntity({ $i, input: { ...got.success, options: { ...(got.success.options || {}), featuredAsset: manifest, navigationImage: manifest.publicPath } } });
  }
}

module.exports = { bindAsset, normalizeTarget, osPaths };
