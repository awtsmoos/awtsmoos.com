//B"H
//Boruch Hashem
//Blessed be He

const { annotationOf } = require('../../../../api/social/helper/comments/richCommentPolicy.js');
const { encodeSegment, escapeHtml } = require('../../../../seo/html.js');
const { commentPlainText } = require('./commentText.js');

/**
 * @file Server-rendered indexed comment/source HTML.
 * @description The Awtsmoos distinguishes immutable Torah source-light from social discussion; Awtsmoos.com renders each vessel truthfully without inventing a profile for classical sources.
 */
const KIND_LABELS = Object.freeze({
	commentary: 'Classical Commentary',
	translation: 'Translation',
	related: 'Related Torah'
});

/** Builds the canonical native comment/source URL already promised by the rich-comment schema. */
function commentUrl(comment = {}) {
	return `/heichelos/${encodeSegment(comment.heichelId)}/posts/${encodeSegment(comment.postId)}/comments/${encodeSegment(comment.id)}`;
}

/** Builds the stable parent teaching URL from comment coordinates. */
function parentPostUrl(comment = {}) {
	const heichel = encodeSegment(comment.heichelId);
	const post = encodeSegment(comment.postId);
	if (comment.seriesId && comment.seriesId !== 'root') {
		return `/heichelos/${heichel}/series/${encodeSegment(comment.seriesId)}/post/${post}`;
	}
	return `/heichelos/${heichel}/post/${post}`;
}

/** Renders one immutable canonical Torah source without social-profile semantics. */
function renderSourceHtml(comment, annotation, headingLevel, text, replyHtml) {
	const kind = KIND_LABELS[String(annotation.kind || '')] || 'Torah Source';
	const descriptor = [kind, annotation.language].filter(Boolean).join(' · ');
	const heading = `${escapeHtml(annotation.name)}${descriptor ? ` <small>${escapeHtml(descriptor)}</small>` : ''}`;
	return `<article id="comment-${escapeHtml(comment.id || '')}" data-awtsmoos-indexed-comment data-awtsmoos-torah-source><h${headingLevel}>${heading}</h${headingLevel}><p>${escapeHtml(text || annotation.name || 'Torah source')}</p><p><a href="${commentUrl(comment)}">Canonical source</a> · <a href="${parentPostUrl(comment)}">Parent teaching</a></p>${replyHtml}</article>`;
}

/** Renders one ordinary community comment with its social author link. */
function renderCommunityHtml(comment, headingLevel, text, replyHtml) {
	const author = comment.aliasId ? `@${comment.aliasId}` : 'Public contributor';
	const authorHtml = comment.aliasId
		? `<a href="/@/${encodeSegment(comment.aliasId)}">${escapeHtml(author)}</a>`
		: escapeHtml(author);
	return `<article id="comment-${escapeHtml(comment.id || '')}" data-awtsmoos-indexed-comment><h${headingLevel}>Comment by ${authorHtml}</h${headingLevel}><p>${escapeHtml(text || 'Public comment')}</p><p><a href="${commentUrl(comment)}">Canonical comment</a> · <a href="${parentPostUrl(comment)}">Parent teaching</a></p>${replyHtml}</article>`;
}

/** Renders one public comment/source and any already-bounded reply children. */
function renderCommentHtml(comment = {}, options = {}) {
	const text = commentPlainText(comment);
	const replies = Array.isArray(comment.replies) ? comment.replies : [];
	const replyHtml = replies.length
		? `<section aria-label="Replies">${replies.map(reply => renderCommentHtml(reply, options)).join('')}</section>`
		: '';
	const headingLevel = Math.min(6, Math.max(2, Number(options.headingLevel) || 3));
	const annotation = annotationOf(comment);
	return annotation
		? renderSourceHtml(comment, annotation, headingLevel, text, replyHtml)
		: renderCommunityHtml(comment, headingLevel, text, replyHtml);
}

module.exports = {
	commentUrl,
	parentPostUrl,
	renderCommentHtml
};
