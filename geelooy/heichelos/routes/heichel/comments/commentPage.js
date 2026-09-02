// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentPage.js
 * @description
 * The Awtsmoos opens the native canonical comment address as a true document instead of an API-shaped shadow;
 * Awtsmoos.com reveals full public text, author, parent teaching, and bounded reply light before any browser actions flow.
 */

const access = require('../../../../api/social/helper/comments/richCommentAccess.js');
const reader = require('../../../../api/social/helper/comments/richCommentReader.js');
const { escapeHtml, excerpt } = require('../../../../seo/html.js');
const { commentPlainText } = require('./commentText.js');
const { commentUrl, parentPostUrl, renderCommentHtml } = require('./commentHtml.js');

function missingPage() {
	return {
		statusCode: 404,
		mimeType: 'text/html; charset=utf-8',
		response: '<!DOCTYPE html><html><head><title>Comment unavailable | Awtsmoos</title><meta name="robots" content="noindex,follow"></head><body><main><h1>Comment unavailable</h1></main></body></html>'
	};
}

/** @description Creates a canonical public comment renderer bound to one direct datastore vessel. */
function createCommentPage($i) {
	async function renderCommentPage(vars) {
		const got = access.getComment({
			$i,
			heichelId: vars.heichel,
			postId: vars.post,
			commentId: vars.comment
		});
		if (!got?.success || got.success.deleted) {
			return missingPage();
		}
		const comment = got.success;
		const replies = await reader.getReplies({
			$i,
			heichelId: vars.heichel,
			postId: vars.post,
			commentId: vars.comment,
			limit: 100,
			maxDepth: 4,
			replyLimit: 100
		});
		comment.replies = replies.success || [];
		const text = commentPlainText(comment);
		const author = comment.aliasId ? `@${comment.aliasId}` : 'Public contributor';
		const canonical = `https://awtsmoos.com${commentUrl(comment)}`;
		const response = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Comment by ${escapeHtml(author)} | Awtsmoos</title><meta name="description" content="${escapeHtml(excerpt(text, 220))}"><meta name="robots" content="index,follow,max-snippet:-1"><link rel="canonical" href="${canonical}"></head><body><main><p><a href="${parentPostUrl(comment)}">Back to parent teaching</a></p><h1>Public comment by ${escapeHtml(author)}</h1>${renderCommentHtml(comment, { headingLevel: 2 })}</main></body></html>`;
		return { mimeType: 'text/html; charset=utf-8', response };
	}
	return { renderCommentPage };
}

module.exports = createCommentPage;
