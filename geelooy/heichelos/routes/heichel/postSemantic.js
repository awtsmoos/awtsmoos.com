// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postSemantic.js
 * @description
 * The Awtsmoos gives each teaching one named address and one truthful description; Awtsmoos.com can therefore be searched without splitting one revelation
 * into duplicate shadows, while the living reader remains free to deepen the page after its first semantic breath.
 */

/** @description Escapes untrusted text before it enters HTML metadata. */
function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** @description Collapses display text into a compact search-facing phrase. */
function cleanText(value) {
	return String(value ?? '').replace(/\s+/g, ' ').trim();
}

/** @description Encodes one canonical URL segment. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/**
 * @description Builds one canonical path for a public post, preferring its series identity when known.
 * @param {object} data Reader data vessel.
 * @returns {string} Canonical path.
 */
function buildCanonicalPath(data) {
	const heichelId = data?.heichel?.id || '';
	const postId = data?.post?.id || data?.postId || '';
	const seriesId = data?.parentSeries || data?.post?.parentSeriesId || data?.post?.seriesId || '';
	const base = `/heichelos/${encodeSegment(heichelId)}`;
	if (seriesId && seriesId !== 'root') {
		return `${base}/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}`;
	}
	return `${base}/post/${encodeSegment(postId)}`;
}

/**
 * @description Creates escaped metadata shared by direct and Road reader pages.
 * @param {object} data Reader data vessel.
 * @returns {object} Search-facing semantic model.
 */
function buildPostSemantic(data) {
	const postTitle = cleanText(data?.post?.title) || 'Torah Teaching';
	const heichelName = cleanText(data?.heichel?.name || data?.heichel?.title) || 'Geelooy Heichel';
	const canonicalPath = buildCanonicalPath(data);
	const description = `Read ${postTitle} in ${heichelName} on Awtsmoos.com.`;
	return {
		pageTitle: escapeHtml(`${postTitle} | ${heichelName} | Awtsmoos`),
		description: escapeHtml(description.slice(0, 220)),
		canonicalPath: escapeHtml(canonicalPath),
		canonicalUrl: escapeHtml(`https://awtsmoos.com${canonicalPath}`),
		articleTitle: escapeHtml(postTitle),
		heichelName: escapeHtml(heichelName),
		indexable: Boolean(data?.post && data?.post?.id)
	};
}

module.exports = { buildCanonicalPath, buildPostSemantic, cleanText, escapeHtml };
