// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postAnnotations.js
 * @description
 * The Awtsmoos lets each teaching carry a bounded visible taste of its living discussion and English translation stream;
 * Awtsmoos.com links outward to canonical comment and translation documents so the parent page stays swift while the full graph may gleam.
 */

const reader = require('../../../../api/social/helper/comments/richCommentReader.js');
const { postTranslations } = require('../../../../api/social/helper/comments/translations/reader.js');
const { encodeSegment, escapeHtml, excerpt } = require('../../../../seo/html.js');
const { renderCommentHtml } = require('./commentHtml.js');

function coordinates(data = {}) {
	return {
		heichelId: data.heichelId || data.heichel?.id || data.heichel?.heichelId || '',
		seriesId: data.seriesId || data.parentSeries || 'root',
		postId: data.postId || data.post?.id || data.post?._id || ''
	};
}

async function safeComments($i, point) {
	try {
		return await reader.getTree({ $i, heichelId: point.heichelId, postId: point.postId, limit: 12, maxDepth: 1, replyLimit: 8 });
	} catch (error) {
		console.error('[Awtsmoos post SEO] Comment preview failed.', error);
		return { success: [], meta: {} };
	}
}

async function safeTranslations($i, point) {
	if (!point.seriesId || point.seriesId === 'root') {
		return { success: [] };
	}
	try {
		return await postTranslations({ $i, heichelId: point.heichelId, seriesId: point.seriesId, postId: point.postId });
	} catch (error) {
		console.error('[Awtsmoos post SEO] Translation preview failed.', error);
		return { success: [] };
	}
}

/** @description Renders bounded semantic discussion and translation discovery for one valid teaching. */
async function renderPostAnnotations($i, data) {
	if (!data?.post || data.post.error) {
		return '';
	}
	const point = coordinates(data);
	if (!point.heichelId || !point.postId) {
		return '';
	}
	const [comments, translated] = await Promise.all([safeComments($i, point), safeTranslations($i, point)]);
	const rows = translated?.success || [];
	const commentHtml = (comments?.success || []).map(comment => renderCommentHtml(comment, { headingLevel: 3 })).join('');
	const translationHref = `/heichelos/${encodeSegment(point.heichelId)}/series/${encodeSegment(point.seriesId)}/post/${encodeSegment(point.postId)}/translations`;
	const translationPreview = rows.slice(0, 3).map((row, index) => `<article><h3>English translation ${index + 1}</h3><p lang="en">${escapeHtml(excerpt(row.content || row.text || '', 500))}</p></article>`).join('');
	const commentsSection = commentHtml ? `<section><h2>Public discussion</h2>${commentHtml}</section>` : '';
	const translationSection = rows.length ? `<section><h2>English translations</h2>${translationPreview}<p><a href="${translationHref}">Read all ${rows.length} public translation${rows.length === 1 ? '' : 's'}</a></p></section>` : '';
	return commentsSection || translationSection ? `<aside data-awtsmoos-indexed-annotations>${commentsSection}${translationSection}</aside>` : '';
}

module.exports = { renderPostAnnotations };
