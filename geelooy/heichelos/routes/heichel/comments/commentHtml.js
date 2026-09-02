// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentHtml.js
 * @description
 * The Awtsmoos gives every comment and reply a visible semantic vessel, linking author, parent teaching, and child sparks in one chain;
 * Awtsmoos.com lets discussion become a crawlable tree while every escaped word remains safe from invented HTML rain.
 */

const { encodeSegment, escapeHtml } = require('../../../../seo/html.js');
const { commentPlainText } = require('./commentText.js');

/** @description Builds the canonical native comment URL already promised by the social comment schema. */
function commentUrl(comment = {}) {
	return `/heichelos/${encodeSegment(comment.heichelId)}/posts/${encodeSegment(comment.postId)}/comments/${encodeSegment(comment.id)}`;
}

/** @description Builds the stable parent teaching URL from comment coordinates. */
function parentPostUrl(comment = {}) {
	const heichel = encodeSegment(comment.heichelId);
	const post = encodeSegment(comment.postId);
	if (comment.seriesId && comment.seriesId !== 'root') {
		return `/heichelos/${heichel}/series/${encodeSegment(comment.seriesId)}/post/${post}`;
	}
	return `/heichelos/${heichel}/post/${post}`;
}

/** @description Renders one public comment and any already-bounded reply children. */
function renderCommentHtml(comment = {}, options = {}) {
	const text = commentPlainText(comment);
	const author = comment.aliasId ? `@${comment.aliasId}` : 'Public contributor';
	const authorHtml = comment.aliasId
		? `<a href="/@/${encodeSegment(comment.aliasId)}">${escapeHtml(author)}</a>`
		: escapeHtml(author);
	const self = commentUrl(comment);
	const replies = Array.isArray(comment.replies) ? comment.replies : [];
	const replyHtml = replies.length
		? `<section aria-label="Replies">${replies.map(reply => renderCommentHtml(reply, options)).join('')}</section>`
		: '';
	const headingLevel = Math.min(6, Math.max(2, Number(options.headingLevel) || 3));
	return `<article id="comment-${escapeHtml(comment.id || '')}" data-awtsmoos-indexed-comment><h${headingLevel}>Comment by ${authorHtml}</h${headingLevel}><p>${escapeHtml(text || 'Public comment')}</p><p><a href="${self}">Canonical comment</a> · <a href="${parentPostUrl(comment)}">Parent teaching</a></p>${replyHtml}</article>`;
}

module.exports = {
	commentUrl,
	parentPostUrl,
	renderCommentHtml
};
