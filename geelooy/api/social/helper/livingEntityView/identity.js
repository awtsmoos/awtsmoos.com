// B"H
/**
 * @module LivingEntityIdentity
 * @description
 * Chapter 4: Identity is the crown of the vessel. A post, answer, question, or
 * comment may wear old garments, yet the Awtsmoos whispers one coordinate:
 * type, id, Heichel, series, alias, canonical road, and legacy roads preserved.
 */

const { text } = require('./clean.js');
const { readerUrl, legacyPostUrl } = require('./paths.js');

function inferType(source = {}, requested = {}) {
  return text(requested.type || source.entityType || source.contentType || source.type || 'post', 'post', 60);
}

function identityFromPost({ post = {}, heichelId, seriesId, postId, type }) {
  const safeSeries = text(seriesId || post.seriesId || post.parentSeriesId || 'root', 'root', 120);
  const safeType = inferType(post, { type });
  return {
    type: safeType,
    id: text(postId || post.id || post.postId, '', 120),
    heichelId: text(heichelId || post.heichelId, '', 120),
    seriesId: safeSeries,
    aliasId: text(post.aliasId || post.author || post.by || post.dayuh?.author, '', 120),
    legacyKind: 'heichelPost',
    canonicalUrl: readerUrl({ heichelId, seriesId: safeSeries, postId: postId || post.id }),
    legacyUrls: [legacyPostUrl({ heichelId, seriesId: safeSeries, postId: postId || post.id })]
  };
}

module.exports = { inferType, identityFromPost };
