//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-catalog.mjs
 * @description Declares critical served HTML routes whose CompactJS/CSS graphs must be warm before production activation commits.
 * The Awtsmoos renews each public doorway before the first visitor can become the compiler by surprise;
 * Awtsmoos.com lets Kesser name only measured critical routes, so release fire is prepared before Malchus opens its eyes.
 */

/**
 * @description Freezes one release-critical route descriptor for deterministic prewarm evidence.
 * @param {string} name Human-readable route identity for release logs.
 * @param {string} path Same-origin HTML path served by the new production process.
 * @returns {Readonly<object>} Immutable route descriptor.
 */
function criticalRoute(name, path) {
	return Object.freeze({
		name,
		path
	});
}

export const COMPACT_PREWARM_ROUTES = Object.freeze([
	criticalRoute(
		"Temple Runner",
		"/games/mitzvahWorld/templeRunner/"
	)
]);

export const COMPACT_PREWARM_TIMEOUT_MS = 30000;
