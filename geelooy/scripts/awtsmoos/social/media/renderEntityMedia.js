// B"H
/**
 * @module RenderEntityMedia
 * @description
 * One universal renderer for posts, questions, answers, comments, replies,
 * series, sections, segments, notes, and future social vessels.
 */

import { escapeHtml, normalizeAssets, text } from './mediaManifest.js';
import { renderAsset } from './renderAsset.js';

function own(value, key) {
  return Object.prototype.hasOwnProperty.call(value || {}, key) ? value[key] : '';
}

function entityLabel(entity = {}) {
  return text(own(entity, 'title') || own(entity, 'name') || own(entity, 'id') || own(entity, 'entityId') || own(entity, 'type') || 'Entity');
}

function nodeLabel(node = {}, fallback = 'Section') {
  return text(own(node, 'title') || own(node, 'id') || own(node, 'segmentId') || own(node, 'name') || fallback);
}

function gallery(assets, label) {
  const body = normalizeAssets(assets).map(renderAsset).filter(Boolean).join('');
  return body ? `<section class="bh-social-gallery" aria-label="${escapeHtml(label)}">${body}</section>` : '';
}

function pushGallery(parts, assets, label) {
  const html = gallery(assets, label);
  if (html) parts.push(html);
}

function collectEntityGalleries(entity = {}) {
  const parts = [];
  pushGallery(parts, entity.media || entity.rootAssets || entity.assets, `${entityLabel(entity)} media`);
  for (const note of normalizeAssets(entity.notes || entity.verseNotes)) {
    pushGallery(parts, note.media || note.assets || note.rootAssets, `${nodeLabel(note, 'Note')} media`);
  }
  for (const section of normalizeAssets(entity.sections || entity.subSeries || entity.subsections)) {
    pushGallery(parts, section.media || section.assets || section.rootAssets, `${nodeLabel(section)} media`);
    for (const segment of normalizeAssets(section.segments || section.subsections || section.verses)) {
      pushGallery(parts, segment.media || segment.assets || segment.rootAssets, `${nodeLabel(segment, 'Segment')} media`);
    }
  }
  return parts;
}

export function hasEntityMedia(entity = {}) {
  return collectEntityGalleries(entity).length > 0;
}

export function renderEntityMedia(entity = {}) {
  return collectEntityGalleries(entity).join('');
}
