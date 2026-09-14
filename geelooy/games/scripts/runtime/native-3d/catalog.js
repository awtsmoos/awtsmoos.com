//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file catalog.js
 * @description Names Games routes whose ordinary presentation includes a 2D
 * canvas/DOM surface and therefore receives the shared optional native 3D mode.
 *
 * Invariants:
 * - Membership affects presentation only, never gameplay availability or rules.
 * - Hybrid titles may remain listed because their 2D surface still deserves the option.
 * - Infrastructure, docs, tests, Party hub, and Mitzvah World are intentionally excluded.
 */
const TWO_D_SLUGS = new Set([
	'kavanah', 'nachash', 'adventure', 'awtsmoos-bounce', 'brick-blast',
	'cards', 'chess', 'city-of-light', 'cobyk', 'connect4', 'dove', 'emojis',
	'kabbalah-shooter', 'migdol', 'neshama-quest', 'nitzotz-io', 'ohrfront',
	'pong', 'rebbe-runner', 'scribe-journey', 'sefira-clash', 'seven-mitzvos',
	'shema-strike', 'soul-jump', 'sulam-ha-sod', 'tetris'
]);

/** Return the normalized current Games slug. */
export function currentGameSlug(locationObject = globalThis.location) {
	const match = String(locationObject?.pathname || '').match(/\/games\/([^/]+)/i);
	return match?.[1]?.toLowerCase() || '';
}

/** Return whether the current title should expose the optional native 3D mode. */
export function supportsOptionalNative3D(locationObject = globalThis.location) {
	return TWO_D_SLUGS.has(currentGameSlug(locationObject));
}
