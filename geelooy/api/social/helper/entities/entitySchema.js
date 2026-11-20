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

function mediaKindOf(asset) {
  const type = String(asset?.type || asset?.kind || asset?.mime || asset?.contentType || '').toLowerCase();
  if (type.includes('audio')) return 'audio';
  if (type.includes('video')) return 'video';
  const url = String(asset?.publicPath || asset?.url || '');
  if (/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url)) return 'audio';
  if (/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url)) return 'video';
  return '';
}

function normalizeMediaAsset(asset) {
  if (!asset || typeof asset !== 'object') return null;
  const ref = {
    id: clean(asset.id || asset.assetId || '', '', 140),
    publicPath: clean(asset.publicPath || asset.url || '', '', 600),
    mime: clean(asset.mime || asset.contentType || '', '', 80),
    type: mediaKindOf(asset),
    originalName: clean(asset.originalName || asset.name || '', '', 180),
    size: Number(asset.size || 0) || 0
  };
  return (ref.id || ref.publicPath) && ref.type ? ref : null;
}

/**
 * The post's first-class media: at most one audio and one video attachment.
 * An explicit `media` body field wins; any empty slot is derived from the
 * root assets so clients that only send `assets` are covered too.
 */
function normalizeMedia(value, rootAssets = []) {
  let parsed = value;
  if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch { parsed = null; } }
  const media = {};
  if (parsed && typeof parsed === 'object') {
    for (const kind of ['audio', 'video']) {
      const ref = normalizeMediaAsset(parsed[kind]);
      if (ref && ref.type === kind) media[kind] = ref;
    }
  }
  for (const asset of Array.isArray(rootAssets) ? rootAssets : []) {
    const ref = normalizeMediaAsset(asset);
    if (ref && !media[ref.type]) media[ref.type] = ref;
  }
  return Object.keys(media).length ? media : null;
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
  const normalizedRootAssets = normalizeAssets(input.rootAssets || input.assets);
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
    rootAssets: normalizedRootAssets,
    media: normalizeMedia(input.media, normalizedRootAssets),
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

module.exports = { VALID_TYPES, VALID_MODES, normalizeEntity, normalizeVerse, normalizeSubsection, normalizeAssets, normalizeMedia, entityPathId, entityKind };
