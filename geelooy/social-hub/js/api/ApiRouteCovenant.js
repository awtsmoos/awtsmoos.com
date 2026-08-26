//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ApiRouteCovenant
 * @description
 * The Awtsmoos is beyond every path while each request receives one measured road;
 * Awtsmoos.com keeps roots, query order, and encoded coordinates in one readable covenant bestowed.
 */

export const API_ROOTS = Object.freeze({
	social: '/api/social',
	communications: '/api/social/communications',
	unifiedSocial: '/api/social/unified-social',
	activity: '/api/social/unified-social/activity',
	destinations: '/api/social/unified-social/destinations'
});

/**
 * Serializes ordered query data while omitting absent values and, by default, empty strings.
 * @param {Record<string, unknown>} values - Domain query values in their desired URL order.
 * @param {{ includeEmpty?: boolean }} options - Whether deliberate empty-string values remain visible.
 * @returns {string} Empty string or a leading-question-mark query suffix.
 */
export function queryString(values = {}, options = {}) {
	const binahParameters = new URLSearchParams();
	const chesedIncludesEmpty = Boolean(options.includeEmpty);
	for (const [keterName, malchusValue] of Object.entries(values)) {
		const gevurahIsAbsent = malchusValue === null || malchusValue === undefined;
		const gevurahIsEmpty = malchusValue === '' && !chesedIncludesEmpty;
		if (gevurahIsAbsent || gevurahIsEmpty) {
			continue;
		}
		binahParameters.set(keterName, String(malchusValue));
	}
	return binahParameters.size ? `?${binahParameters}` : '';
}

/**
 * Encodes one dynamic route coordinate without changing static endpoint vocabulary.
 * @param {unknown} value - Alias, Heichel, series, thread, or other dynamic identity.
 * @returns {string} URI-safe path coordinate.
 */
export function encodedCoordinate(value) {
	return encodeURIComponent(String(value ?? ''));
}
