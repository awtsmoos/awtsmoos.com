// B"H
/**
 * @file constants.js
 * @description
 * The reader's route covenant keeps every post inside its real series vessel.
 * The root series is a genuine series, not missing context; only an empty
 * series identity is a rupture. Thus old shorthand links and explicit
 * `/post/:postId` links may both resolve through the same contextual API.
 */

/**
 * Constructs the contextual URL used to fetch one series.
 *
 * @param {string} heichelId - The heichel identity.
 * @param {string} seriesId - The series identity, including `root`.
 * @returns {string} The series-details API URL.
 */
export function constructSeriesDetailsUrl(heichelId, seriesId) {
	return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/details`;
}

/**
 * Constructs the contextual URL used to fetch one post.
 *
 * @param {string} heichelId - The heichel identity.
 * @param {string} seriesId - The real series identity, including `root`.
 * @param {string} postId - The post identity.
 * @returns {string} The contextual post API URL.
 */
export function constructPostUrl(heichelId, seriesId, postId) {
	if (!seriesId) {
		throw new Error("POST_READER_REQUIRES_SERIES_CONTEXT");
	}
	return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}`;
}

/**
 * Constructs the contextual breadcrumb URL.
 *
 * @param {string} heichelId - The heichel identity.
 * @param {string} seriesId - The series identity, including `root`.
 * @returns {string} The breadcrumb API URL.
 */
export function constructBreadcrumbUrl(heichelId, seriesId) {
	return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/breadcrumb`;
}
