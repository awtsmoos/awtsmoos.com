// B"H
/**
 * @module LivingEntityContent
 * @description
 * Chapter 5: Content descends as root light and sectioned chambers. The old blob
 * is honored, the verse-palace is honored, and every subsection becomes a quiet
 * addressable spark without demanding that the reader stare at machinery.
 */

const { text, list, values, number } = require('./clean.js');

function normalizeAsset(asset = {}) {
  if (typeof asset === 'string') return { id: text(asset, '', 160) };
  return {
    id: text(asset.id || asset.assetId, '', 160),
    type: text(asset.type || asset.kind, '', 40),
    publicPath: text(asset.publicPath || asset.url, '', 600),
    alt: text(asset.alt || asset.title, '', 220)
  };
}

function normalizeSection(section = {}, index = 0) {
  return {
    id: text(section.id || section.sectionId || section.verseSection || `section_${index + 1}`, '', 120),
    type: text(section.type || section.segmentType || 'section', 'section', 60),
    title: text(section.title || section.label, '', 240),
    content: text(section.content || section.text || section.html, '', 50000),
    html: text(section.html || section.content || section.text, '', 50000),
    verseSection: text(section.verseSection || section.id || index, String(index), 120),
    assets: list(section.assets).map(normalizeAsset).filter(asset => asset.id || asset.publicPath),
    children: list(section.children || section.segments || section.subsections).map(normalizeSection),
    order: number(section.order, index)
  };
}

function normalizeSections(post = {}, storedSections = {}) {
  const direct = list(post.sections || post.verses || post.nodes);
  const fromStore = values(storedSections);
  return [...direct, ...fromStore].map(normalizeSection).filter(section => section.id || section.content || section.title);
}

function contentFromPost({ post = {}, storedSections = {} }) {
  const sections = normalizeSections(post, storedSections);
  return {
    title: text(post.title || post.name || post.id || post.postId, '', 240),
    summary: text(post.summary || post.description || post.excerpt || post.content, '', 1000),
    rootContent: text(post.rootContent || post.content || post.description || post.dayuh?.content, '', 50000),
    sections,
    assets: list(post.rootAssets || post.assets).map(normalizeAsset).filter(asset => asset.id || asset.publicPath)
  };
}

module.exports = { normalizeAsset, normalizeSection, normalizeSections, contentFromPost };
