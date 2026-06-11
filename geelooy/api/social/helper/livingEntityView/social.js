// B"H
/**
 * @module LivingEntitySocial
 * @description
 * Chapter 6: Comments are not dust beneath the post. They are sparks with roots,
 * verse gates, subsection gates, and their own URLs. This read-only chamber
 * counts and groups them without disturbing the old comment trees.
 */

const { text, values } = require('./clean.js');
const { commentUrl } = require('./paths.js');

function normalizeComment(comment = {}) {
  return {
    id: text(comment.id || comment.commentId, '', 160),
    aliasId: text(comment.aliasId || comment.author, '', 120),
    content: text(comment.content || comment.audioNoteText || comment.dayuh?.content, '', 1200),
    verseSection: text(comment.verseSection || comment.verseId || 'root', 'root', 120),
    subsectionId: text(comment.subsectionId || comment.segmentId || comment.dayuh?.subSection, '', 120),
    parentId: text(comment.parentId, '', 160),
    url: commentUrl(comment),
    createdAt: Number(comment.createdAt || comment.timestamp || 0),
    repliesCount: Array.isArray(comment.replies) ? comment.replies.length : 0
  };
}

function groupBy(items, field) {
  return items.reduce((map, item) => {
    const key = item[field] || 'root';
    if (!map[key]) map[key] = [];
    map[key].push(item);
    return map;
  }, {});
}

function socialFromTrees({ richTree = [], legacyTree = [] }) {
  const comments = [...values(richTree), ...values(legacyTree)].map(normalizeComment).filter(comment => comment.id || comment.content);
  return {
    comments,
    commentsByVerse: groupBy(comments, 'verseSection'),
    commentsBySubsection: groupBy(comments, 'subsectionId'),
    commentCount: comments.length
  };
}

module.exports = { normalizeComment, socialFromTrees, groupBy };
