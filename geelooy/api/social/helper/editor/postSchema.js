// B"H
/**
 * @module StructuredPostSchema
 * @description
 * Chapter 127: Posts become vessels of root content, verses, subsections, and
 * assets at every level. Comments may point to verse/subsection coordinates.
 */

function clean(value, max = 2000) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || '[]'); } catch { return []; }
}

function normalizeAssets(value) {
  return parseArray(value).map(asset => typeof asset === 'string' ? { id: asset } : asset).filter(asset => asset && asset.id).slice(0, 30);
}

function normalizeSubsection(value, index) {
  return {
    id: clean(value.id || value.subsectionId || `sub_${index + 1}`, 80),
    title: clean(value.title || `Subsection ${index + 1}`, 180),
    text: clean(value.text || value.content || '', 8000),
    assets: normalizeAssets(value.assets),
    order: Number.isFinite(Number(value.order)) ? Number(value.order) : index
  };
}

function normalizeVerse(value, index) {
  const subsections = Array.isArray(value.subsections) ? value.subsections : parseArray(value.subsections);
  return {
    id: clean(value.id || value.verseId || value.verseSection || `verse_${index + 1}`, 80),
    label: clean(value.label || value.title || `Verse ${index + 1}`, 180),
    verseSection: clean(value.verseSection || value.id || `verse_${index + 1}`, 80),
    text: clean(value.text || value.content || '', 12000),
    assets: normalizeAssets(value.assets),
    subsections: subsections.map(normalizeSubsection),
    order: Number.isFinite(Number(value.order)) ? Number(value.order) : index
  };
}

function normalizePostDraft(body = {}) {
  const verses = parseArray(body.verses || body.sections).map(normalizeVerse);
  return {
    id: clean(body.postId || body.id || '', 100),
    heichelId: clean(body.heichelId, 100),
    seriesId: clean(body.seriesId || body.parentSeriesId || 'root', 100),
    author: clean(body.aliasId || body.author, 100),
    title: clean(body.title, 180),
    description: clean(body.description || body.content, 1600),
    rootAssets: normalizeAssets(body.rootAssets || body.assets),
    verses,
    commentsEnabled: body.commentsEnabled !== 'false',
    submissionStatus: clean(body.submissionStatus || 'draft', 32),
    updatedAt: Date.now()
  };
}

function toContentSections(draft) {
  return draft.verses.map(verse => ({ id: verse.id, verseSection: verse.verseSection, title: verse.label, content: verse.text, assets: verse.assets, segments: verse.subsections.map(sub => ({ id: sub.id, label: sub.title, content: sub.text, assets: sub.assets })) }));
}

module.exports = { normalizePostDraft, normalizeVerse, normalizeSubsection, normalizeAssets, toContentSections };
