// B"H
/**
 * @module SocialEntitySchema
 * @description
 * Chapter 151: One entity covenant for plain posts, complex verse-posts,
 * questions, and answers. The Awtsmoos lets content appear as a simple root
 * spark or as a palace of verses and subsections without splitting the API.
 */

const VALID_TYPES = new Set(['post', 'question', 'answer']);
const VALID_MODES = new Set(['plain', 'structured']);

function clean(value, fallback = '', max = 4000) {
  return String(value ?? fallback).replace(/[<>]/g, '').trim().slice(0, max);
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || '[]'); } catch { return []; }
}

function normalizeAssets(value) {
  return parseArray(value).map(item => typeof item === 'string' ? { id: item } : item).filter(item => item && (item.id || item.publicPath)).slice(0, 40);
}

function normalizeSubsection(value = {}, index = 0) {
  return {
    id: clean(value.id || value.subsectionId || value.segmentId || `sub_${index + 1}`, '', 90),
    title: clean(value.title || value.label || `Subsection ${index + 1}`, '', 220),
    content: clean(value.content || value.text || value.html || '', '', 12000),
    html: clean(value.html || value.content || value.text || '', '', 12000),
    assets: normalizeAssets(value.assets),
    order: Number.isFinite(Number(value.order)) ? Number(value.order) : index,
    options: value.options && typeof value.options === 'object' ? value.options : {}
  };
}

function normalizeVerse(value = {}, index = 0) {
  const segments = Array.isArray(value.segments) ? value.segments : parseArray(value.subsections || value.segments);
  const id = clean(value.id || value.verseId || value.verseSection || `verse_${index + 1}`, '', 90);
  return {
    id,
    sectionId: id,
    verseSection: clean(value.verseSection || id, id, 90),
    title: clean(value.title || value.label || `Verse ${index + 1}`, '', 220),
    content: clean(value.content || value.text || value.html || '', '', 16000),
    html: clean(value.html || value.content || value.text || '', '', 16000),
    assets: normalizeAssets(value.assets),
    segmentType: clean(value.segmentType || 'verse', 'verse', 60),
    segments: segments.map(normalizeSubsection),
    order: Number.isFinite(Number(value.order)) ? Number(value.order) : index,
    options: value.options && typeof value.options === 'object' ? value.options : {}
  };
}

function normalizeEntity(input = {}) {
  const type = VALID_TYPES.has(clean(input.type || input.contentType || 'post').toLowerCase()) ? clean(input.type || input.contentType || 'post').toLowerCase() : 'post';
  const rawSections = parseArray(input.sections || input.verses);
  const mode = VALID_MODES.has(clean(input.mode || input.entityMode || '').toLowerCase()) ? clean(input.mode || input.entityMode).toLowerCase() : (rawSections.length ? 'structured' : 'plain');
  return {
    id: clean(input.id || input.postId || input.questionId || input.answerId || '', '', 120),
    type,
    mode,
    heichelId: clean(input.heichelId, '', 120),
    seriesId: clean(input.seriesId || input.parentSeriesId || 'root', 'root', 120),
    aliasId: clean(input.aliasId || input.author, '', 120),
    parentQuestionId: clean(input.parentQuestionId || input.questionId || '', '', 120),
    title: clean(input.title || input.name || '', '', 240),
    rootContent: clean(input.rootContent || input.content || input.description || '', '', 30000),
    rootAssets: normalizeAssets(input.rootAssets || input.assets),
    sections: mode === 'structured' ? rawSections.map(normalizeVerse) : [],
    options: input.options && typeof input.options === 'object' ? input.options : {},
    commentsEnabled: input.commentsEnabled !== 'false',
    createdAt: Number(input.createdAt || 0) || Date.now(),
    updatedAt: Date.now()
  };
}

function entityPathId(entity) {
  return entity.id || `${entity.type}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function entityKind(entity) {
  return entity.type === 'question' ? 'question' : entity.type === 'answer' ? 'answer' : 'post';
}

module.exports = { VALID_TYPES, VALID_MODES, normalizeEntity, normalizeVerse, normalizeSubsection, normalizeAssets, entityPathId, entityKind };
