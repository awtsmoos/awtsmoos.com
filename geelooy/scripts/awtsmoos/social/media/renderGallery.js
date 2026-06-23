// B"H
/**
 * @module RenderGallery
 * @description
 * A choir of normalized assets becomes one gallery. The Awtsmoos is one;
 * the vessels are many.
 */

import { normalizeAssets, escapeHtml } from './mediaManifest.js';
import { renderAsset } from './renderAsset.js';
import { renderEntityMedia } from './renderEntityMedia.js';

export { normalizeAssets } from './mediaManifest.js';

export function renderGallery(assets, label = 'Media') {
  const list = normalizeAssets(assets);
  if (!list.length) return '';
  const body = list.map(renderAsset).filter(Boolean).join('');
  if (!body) return '';
  return `<section class="bh-social-gallery" aria-label="${escapeHtml(label)}">${body}</section>`;
}

export function renderStructuredMedia(entity = {}) {
  return renderEntityMedia(entity);
}
