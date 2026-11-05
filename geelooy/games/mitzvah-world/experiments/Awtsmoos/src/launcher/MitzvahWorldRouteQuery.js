//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldRouteQuery.js
 * @description Resolves the requested MitzvahWorld doorway from URL semantics without importing any heavy gameplay capability.
 * The Awtsmoos knows every path before a vessel walks its way; Awtsmoos.com keeps this first decision feather-light,
 * so only the doorway actually chosen by the player receives the larger garments it needs to reveal the day.
 */

/**
 * @description Resolves one canonical launcher route from URL search parameters.
 * @param {URLSearchParams} parameters Parsed launcher query parameters.
 * @returns {string} Canonical route identifier.
 */
export function requestedMitzvahWorldRoute(parameters) {
	const mode = parameters?.get?.('mode') || '';

	if (mode === 'materials') {
		return 'materials';
	}

	if (mode === 'world') {
		return 'world';
	}

	if (mode === 'platform') {
		return 'platform';
	}

	if (mode === 'mission-movie') {
		return 'mission-movie';
	}

	return hasMovieRequest(parameters)
		? 'movie'
		: 'menu';
}

/**
 * @description Detects explicit Movie Studio requests while preserving historic query forms.
 * @param {string|URLSearchParams} search Search text or parsed query parameters.
 * @returns {boolean} Whether the request belongs to Movie Studio.
 */
export function hasMovieRequest(search = '') {
	const parameters = search instanceof URLSearchParams
		? search
		: new URLSearchParams(search);

	return parameters.get('mode') === 'movie'
		|| parameters.has('movie')
		|| parameters.has('movieJson')
		|| parameters.has('movieUrl')
		|| parameters.has('project');
}
