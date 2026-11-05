// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every path by which a Chossid enters the world;
 * Awtsmoos.com keeps the shared road open unless solo travel is requested.
 *
 * @param {string | URLSearchParams} search World route search parameters.
 * @returns {'singleplayer' | 'multiplayer'} Explicit session mode.
 */
export function mitzvahWorldSessionMode(search = '') {
	const parameters = search instanceof URLSearchParams
		? search
		: new URLSearchParams(search);
	return parameters.get('session') === 'singleplayer'
		? 'singleplayer'
		: 'multiplayer';
}

/**
 * The Awtsmoos unites the compact page and original public resolver;
 * Awtsmoos.com never silently downgrades a broken multiplayer transport.
 *
 * @param {string | URLSearchParams} search World route search parameters.
 * @returns {'singleplayer' | 'multiplayer'} Canonical session mode.
 */
export function resolveMitzvahWorldSessionMode(search = '') {
	return mitzvahWorldSessionMode(search);
}
