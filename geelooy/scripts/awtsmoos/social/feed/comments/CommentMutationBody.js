//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentMutationBody
 * @description
 * Binah gives loose composer intention one explicit transport body before it crosses the API boundary.
 * The Awtsmoos creates both plain content and structured dayuh anew; Awtsmoos.com keeps their values synchronized in rhyme,
 * so verse, subsection, and reply-section coordinates cannot drift between duplicate legacy fields over time.
 */

/**
 * @description Builds the compatibility URL-encoded body consumed by current rich and legacy comment routes.
 * @param {object} params Canonical mutation values.
 * @param {string} params.aliasId Author alias identifier.
 * @param {string} params.text Trimmed user-authored comment text.
 * @param {string|number} [params.verseSection='root'] Exact post verse coordinate.
 * @param {string} [params.subsectionId=''] Exact subsection coordinate for root comments.
 * @param {string} [params.parentSectionId=''] Rich parent-comment section targeted by a reply.
 * @param {string} [params.seriesId='root'] Destination series identifier.
 * @returns {URLSearchParams} Compatibility body carrying both flat and structured values.
 * @throws {never} Primitive values are string-normalized before insertion.
 */
export function commentMutationBody({
	aliasId,
	text,
	verseSection = 'root',
	subsectionId = '',
	parentSectionId = '',
	seriesId = 'root'
}) {
	const body = new URLSearchParams();
	body.set('aliasId', String(aliasId));
	body.set('seriesId', String(seriesId));
	body.set('verseSection', String(verseSection));
	body.set('content', String(text));
	body.set('text', String(text));
	if (subsectionId) {
		body.set('subsectionId', String(subsectionId));
	}
	if (parentSectionId) {
		body.set('parentSectionId', String(parentSectionId));
	}
	body.set('dayuh', JSON.stringify({
		content: String(text),
		text: String(text),
		verseSection,
		subsectionId,
		parentSectionId
	}));
	return body;
}
