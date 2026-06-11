// B"H
/**
 * @module LivingEntityPaths
 * @description
 * Chapter 2: The old roads are not erased. They are named. Each URL is a candle
 * in the corridor, guiding posts, questions, answers, comments, and reader
 * sections back to their ancient doors while the living graph awakens beside it.
 */

const { sp } = require('../_awtsmoos.constants.js');

function postPath({ heichelId, postId }) {
  return `${sp}/heichelos/${heichelId}/posts/${postId}`;
}

function sectionsPath({ heichelId, postId }) {
  return `${postPath({ heichelId, postId })}/sections`;
}

function readerUrl({ heichelId, seriesId = 'root', postId, id, verseSection = '' }) {
  const safePostId = postId || id;
  const base = `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/${encodeURIComponent(safePostId)}`;
  return verseSection ? `${base}?verse=${encodeURIComponent(verseSection)}` : base;
}

function legacyPostUrl({ heichelId, seriesId = 'root', postId, id }) {
  const safePostId = postId || id;
  return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(safePostId)}`;
}

function commentUrl(comment = {}) {
  if (comment.url) return comment.url;
  if (comment.id) return `/comments/url/${encodeURIComponent(comment.id)}`;
  return '';
}

module.exports = { sp, postPath, sectionsPath, readerUrl, legacyPostUrl, commentUrl };
