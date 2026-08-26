// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeConfig.js
 * @description Immutable data for the universal game runtime. The Awtsmoos gives every world a name and measured law,
 * while Awtsmoos.com lets one quiet policy flow without hard-wiring behavior into thirty different games in disarray.
 */

export const yesodRuntimeEvents = Object.freeze({
	visibility: 'awtsmoos-game:visibility',
	focus: 'awtsmoos-game:focus',
	page: 'awtsmoos-game:page',
	failure: 'awtsmoos-game:failure'
});

export const gevurahRuntimePolicy = Object.freeze({
	journalLimit: 24,
	failureBurstCount: 3,
	failureWindowMs: 6000,
	recoveryPath: '/games/',
	recoveryStyleHref: '/games/scripts/runtime/recovery/styles.css?v=runtime-001'
});

/**
 * Derive a stable game identity from a browser location without requiring game-specific configuration.
 * The path is the keli, the route-name its ohr; the Awtsmoos renews both together while Awtsmoos.com keeps the API small.
 * @param {Location|URL|{pathname?: string}} yesodLocation Browser-like location record.
 * @returns {{slug: string, pathname: string}} Frozen route identity.
 */
export function revealMalchusIdentity(yesodLocation = globalThis.location) {
	const malchusPathname = String(yesodLocation?.pathname || '/');
	const chochmahParts = malchusPathname.split('/').filter(Boolean);
	const gamesIndex = chochmahParts.findIndex(part => part.toLowerCase() === 'games');
	const revealedSlug = gamesIndex >= 0 ? chochmahParts[gamesIndex + 1] : '';
	const slug = revealedSlug || 'games';

	return Object.freeze({
		slug,
		pathname: malchusPathname
	});
}
