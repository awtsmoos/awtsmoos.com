// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ExactDestination
 * @description
 * The Awtsmoos joins provenance to place, so every result may return to truth;
 * at Awtsmoos.com identifiers become one encoded path from source to reader roof.
 * Posts receive one canonical doorway, comments receive their exact query light,
 * while sidecar text remains honest source material instead of a counterfeit site.
 */

export const SIDECAR_SOURCE = 'sichosKodeshDocumentSidecar';

/**
 * Tests whether a coordinate actually exists.
 *
 * @param {unknown} value Candidate coordinate.
 * @returns {boolean} True when the value is present.
 */
export function present(value) {
	return value !== '' && value !== null && value !== undefined;
}

/**
 * Normalizes an identifier without changing its semantic characters.
 *
 * @param {unknown[]} candidates Ordered identifier candidates.
 * @returns {string} First present identifier as trimmed text.
 */
function firstIdentifier(...candidates) {
	const found = candidates.find(present);
	return found === undefined ? '' : String(found).trim();
}

/**
 * Builds the canonical Heichelos post route from a search row and parent row.
 *
 * @param {object} row Result or comment provenance row.
 * @param {object} [parent={}] Parent source row.
 * @returns {string} Encoded post path, or an empty string when no post exists.
 */
export function postDestination(row = {}, parent = {}) {
	const heichel = firstIdentifier(row.heichelId, parent.heichelId, 'ikar');
	const series = firstIdentifier(row.seriesId, parent.seriesId, 'root');
	const post = firstIdentifier(row.postId, parent.postId);
	if (!post) {
		return '';
	}
	return `/heichelos/${encodeURIComponent(heichel)}/series/${encodeURIComponent(series)}/post/${encodeURIComponent(post)}`;
}

/**
 * Builds an exact comment deep link understood by the post reader.
 *
 * @param {object} row Comment provenance row.
 * @param {object} [parent={}] Parent source row.
 * @returns {string} Exact deep link, or empty text when the comment is not linkable.
 */
export function commentDestination(row = {}, parent = {}) {
	if (row.ragCommentSource === SIDECAR_SOURCE || !present(row.id)) {
		return '';
	}
	const postUrl = postDestination(row, parent);
	if (!postUrl) {
		return '';
	}
	const parameters = new URLSearchParams({ commentId: String(row.id) });
	if (present(row.verseSection)) {
		parameters.set('verseSection', String(row.verseSection));
	}
	return `${postUrl}?${parameters.toString()}`;
}
