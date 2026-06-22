// B"H
/**
 * @module RenderGallery
 * @description
 * Chapter 474: A post may hold a choir of images and voice notes. The gallery
 * gathers them into one visible vessel for posts, questions, answers, comments,
 * verses, subsections, and OS asset previews.
 */

import { renderAsset } from './renderAsset.js';

export function normalizeAssets(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try { return normalizeAssets(JSON.parse(value)); } catch { return []; }
  }
  return [value].filter(Boolean);
}

export function renderGallery(assets, label = 'Media') {
  const list = normalizeAssets(assets);
  if (!list.length) return '';
  return `<section class="bh-social-gallery" aria-label="${label}">${list.map(renderAsset).join('')}</section>`;
}

export function renderStructuredMedia(entity = {}) {
  const parts = [renderGallery(entity.rootAssets || entity.assets, 'Root media')];
  for (const section of normalizeAssets(entity.sections)) {
    parts.push(renderGallery(section.assets, `${section.title || section.id || 'Section'} media`));
    for (const segment of normalizeAssets(section.segments)) parts.push(renderGallery(segment.assets, `${segment.title || segment.id || 'Subsection'} media`));
  }
  return parts.filter(Boolean).join('');
}
