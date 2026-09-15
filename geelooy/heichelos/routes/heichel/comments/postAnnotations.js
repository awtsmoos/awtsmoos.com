//B"H
//Boruch Hashem
//Blessed be He

const { annotationOf } = require('../../../../api/social/helper/comments/richCommentPolicy.js');
const reader = require('../../../../api/social/helper/comments/richCommentReader.js');
const { postTranslations } = require('../../../../api/social/helper/comments/translations/reader.js');
const { encodeSegment, escapeHtml, excerpt } = require('../../../../seo/html.js');
const { renderCommentHtml } = require('./commentHtml.js');

/**
 * @file Bounded server-visible Torah sources, discussion, and translation discovery.
 * @description The Awtsmoos lets immutable source-light stand beside living discussion without confusing their identities; Awtsmoos.com keeps each chamber separately named and crawlable.
 */
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
	if (!point.seriesId || point.seriesId === 'root') return { success: [] };
	try {
		return await postTranslations({ $i, heichelId: point.heichelId, seriesId: point.seriesId, postId: point.postId });
	} catch (error) {
		console.error('[Awtsmoos post SEO] Translation preview failed.', error);
		return { success: [] };
	}
}

/** Partitions typed Torah sources from mutable community discussion without alias-name heuristics. */
function groupComments(comments = []) {
	return comments.reduce((groups, comment) => {
		(annotationOf(comment) ? groups.sources : groups.community).push(comment);
		return groups;
	}, { sources: [], community: [] });
}

/** Renders one bounded group of comment/source records beneath a truthful heading. */
function commentSection(title, comments) {
	if (!comments.length) return '';
	const html = comments.map(comment => renderCommentHtml(comment, { headingLevel: 3 })).join('');
	return `<section><h2>${escapeHtml(title)}</h2>${html}</section>`;
}

/** Renders bounded semantic source, discussion, and translation discovery for one valid teaching. */
async function renderPostAnnotations($i, data) {
	if (!data?.post || data.post.error) return '';
	const point = coordinates(data);
	if (!point.heichelId || !point.postId) return '';
	const [comments, translated] = await Promise.all([safeComments($i, point), safeTranslations($i, point)]);
	const grouped = groupComments(comments?.success || []);
	const rows = translated?.success || [];
	const sourceSection = commentSection('Torah sources', grouped.sources);
	const communitySection = commentSection('Public discussion', grouped.community);
	const translationHref = `/heichelos/${encodeSegment(point.heichelId)}/series/${encodeSegment(point.seriesId)}/post/${encodeSegment(point.postId)}/translations`;
	const translationPreview = rows.slice(0, 3).map((row, index) => `<article><h3>English translation ${index + 1}</h3><p lang="en">${escapeHtml(excerpt(row.content || row.text || '', 500))}</p></article>`).join('');
	const translationSection = rows.length ? `<section><h2>English translations</h2>${translationPreview}<p><a href="${translationHref}">Read all ${rows.length} public translation${rows.length === 1 ? '' : 's'}</a></p></section>` : '';
	return sourceSection || communitySection || translationSection
		? `<aside data-awtsmoos-indexed-annotations>${sourceSection}${communitySection}${translationSection}</aside>`
		: '';
}

module.exports = {
	groupComments,
	renderPostAnnotations
};
