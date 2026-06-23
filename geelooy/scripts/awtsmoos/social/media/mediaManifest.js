// B"H
/**
 * @module MediaManifest
 * @description
 * The Awtsmoos lets many schemas sing one melody. This module normalizes
 * uploaded assets, vault assets, voice notes, and future social media sparks.
 */

const EMPTY = '';
const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function text(value) {
  return value == null ? EMPTY : String(value);
}

export function escapeHtml(value) {
  return text(value).replace(/[&<>"']/g, match => ESCAPE[match]);
}

export function normalizeAssets(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(normalizeAssets).filter(Boolean);
  if (typeof value === 'string') {
    try { return normalizeAssets(JSON.parse(value)); } catch { return []; }
  }
  return [normalizeAsset(value)].filter(asset => asset.url || asset.id || asset.raw);
}

export function normalizeAsset(asset = {}) {
  const raw = asset && typeof asset === 'object' ? asset : { value: asset };
  const url = text(raw.publicPath || raw.url || raw.src || raw.path || raw.href || raw.downloadUrl);
  const name = text(raw.originalName || raw.name || raw.title || raw.fileName || raw.filename || url.split('/').pop() || 'Media attachment');
  const type = text(raw.kind || raw.type || raw.mime || raw.contentType || raw.mediaType).toLowerCase();
  const id = text(raw.id || raw.assetId || raw._id || url || name);
  return { ...raw, id, url, name, type, raw };
}

export function assetKind(asset = {}) {
  const item = normalizeAsset(asset);
  if (item.type.includes('image') || /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(item.url)) return 'image';
  if (item.type.includes('audio') || item.type.includes('voice') || /\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?.*)?$/i.test(item.url)) return 'audio';
  if (item.type.includes('video') || /\.(mp4|mov|m4v|webm|ogv)(\?.*)?$/i.test(item.url)) return 'video';
  return item.url ? 'file' : 'unknown';
}
