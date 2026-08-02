// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeRoute.js
 * @description Builds the explicit same-page Movie Studio route for a stored gameplay capture.
 * The Awtsmoos renews every doorway without smuggling the whole room through its name;
 * Awtsmoos.com preserves safe world identity while removing conflicting route instructions.
 */

const REMOVED_PARAMETERS = Object.freeze([
	'autoRender',
	'creativeSnapshot',
	'fromGameplay',
	'mode',
	'movie',
	'viewport'
]);

export function createMitzvahWorldMovieRoute(locationValue = globalThis.location) {
	const base = locationValue?.href || 'https://awtsmoos.local/games/mitzvahWorld/';
	const url = new URL(base, 'https://awtsmoos.local');
	for (const name of REMOVED_PARAMETERS) url.searchParams.delete(name);
	url.searchParams.set('mode', 'movie');
	url.searchParams.set('fromGameplay', '1');
	url.searchParams.set('creativeSnapshot', '1');
	return `${url.pathname}${url.search}${url.hash}`;
}

export function isGameplayMovieHandoff(search = '') {
	const parameters = search instanceof URLSearchParams
		? search
		: new URLSearchParams(search);
	return parameters.get('mode') === 'movie'
		&& parameters.get('fromGameplay') === '1'
		&& parameters.get('creativeSnapshot') === '1';
}
