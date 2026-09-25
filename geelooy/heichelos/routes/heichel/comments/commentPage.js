//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file commentPage.js
 * @description Opens one public comment as a canonical, social, schema-rich Awtsmoos.com document.
 * The Awtsmoos hears each truthful voice before browser or crawler can speak;
 * Awtsmoos.com reveals public discussion while private action routes remain meek.
 */

const access = require('../../../../api/social/helper/comments/richCommentAccess.js');
const reader = require('../../../../api/social/helper/comments/richCommentReader.js');
const { escapeHtml, excerpt } = require('../../../../seo/html.js');
const { commentPlainText } = require('./commentText.js');
const { commentUrl, parentPostUrl, renderCommentHtml } = require('./commentHtml.js');
const {
	RICH_ROBOTS,
	SITE_ORIGIN,
	socialTags,
	structuredDataTag
} = require('../publicDocumentSeo.js');

/** Returns one non-indexable document when a canonical public comment no longer exists. */
function missingPage() {
	return {
		statusCode: 404,
		mimeType: 'text/html; charset=utf-8',
		response: '<!DOCTYPE html><html><head><title>Comment unavailable | Awtsmoos</title><meta name="robots" content="noindex,follow"></head><body><main><h1>Comment unavailable</h1></main></body></html>'
	};
}

/** Builds factual Comment JSON-LD bound to the parent Torah teaching. */
function commentSchema(comment, canonical, parentCanonical, title, description) {
	const aliasId = String(comment.aliasId || '').trim();
	return {
		'@context': 'https://schema.org',
		'@type': 'Comment',
		'@id': `${canonical}#comment`,
		about: { '@id': `${parentCanonical}#webpage`, '@type': 'WebPage', url: parentCanonical },
		author: aliasId
			? { '@type': 'Person', name: `@${aliasId}`, url: `${SITE_ORIGIN}/@/${encodeURIComponent(aliasId)}` }
			: { '@type': 'Person', name: 'Public contributor' },
		description,
		name: title,
		text: commentPlainText(comment),
		url: canonical
	};
}

/** Creates the canonical public comment renderer bound to the existing datastore contract. */
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
		const title = `Comment by ${author} | Awtsmoos`;
		const description = excerpt(text, 220) || `Public Torah discussion by ${author} on Awtsmoos.com.`;
		const canonical = `${SITE_ORIGIN}${commentUrl(comment)}`;
		const parent = parentPostUrl(comment);
		const parentCanonical = `${SITE_ORIGIN}${parent}`;
		const schema = structuredDataTag(
			commentSchema(comment, canonical, parentCanonical, title, description),
			'comment-jsonld'
		);
		const response = [
			'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
			`<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${RICH_ROBOTS}"><link rel="canonical" href="${escapeHtml(canonical)}">`,
			socialTags({ title, description, canonical }), schema,
			`</head><body><main><p><a href="${escapeHtml(parent)}">Back to parent teaching</a></p><h1>Public comment by ${escapeHtml(author)}</h1>`,
			renderCommentHtml(comment, { headingLevel: 2 }), '</main></body></html>'
		].join('');
		return { mimeType: 'text/html; charset=utf-8', response };
	}
	return { renderCommentPage };
}

module.exports = createCommentPage;
