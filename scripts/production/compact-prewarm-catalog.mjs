//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-catalog.mjs
 * @description Declares critical served HTML routes plus deferred CompactJS doors that must be warm before production activation commits.
 * The Awtsmoos renews visible gates and hidden first-play roads before the first visitor can become the compiler by surprise;
 * Awtsmoos.com lets Kesser name only measured critical routes, so release fire is prepared before Malchus opens its eyes.
 */

/**
 * Freezes one release-critical route and any compact assets that live beyond its static HTML.
 * @param {string} name Human-readable route identity for release logs.
 * @param {string} path Same-origin HTML path served by the new production process.
 * @param {string[]} [assets] Same-origin compact assets required before first control.
 * @returns {Readonly<object>} Immutable route descriptor.
 */
function criticalRoute(name, path, assets = []) {
	return Object.freeze({
		name,
		path,
		assets: Object.freeze([...assets])
	});
}

const MITZVAH_WORLD_ROOT = "/games/mitzvahWorld/experiments/Awtsmoos/src/";

export const COMPACT_PREWARM_ROUTES = Object.freeze([
	criticalRoute(
		"Mitzvah World",
		"/games/mitzvahWorld/",
		[
			`${MITZVAH_WORLD_ROOT}launcher/MitzvahWorldDeferredLaunchRuntime.js?v=20260827-lightning-launch-02&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/createEretzRuntime.js?compact=true&v=20260804-map-01`,
			`${MITZVAH_WORLD_ROOT}app/EretzFoundationServices.js?v=20260827-responsive-services-01&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzWebGlBootFrame.js?v=20260827-responsive-frame-01&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzEssentialAssetLoader.js?v=20260827-responsive-assets-01&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/BootstrapWorldFoundation.js?v=20260827-responsive-valley-01&compact=true`
		]
	),
	criticalRoute(
		"Temple Runner",
		"/games/mitzvahWorld/templeRunner/"
	)
]);

export const COMPACT_PREWARM_TIMEOUT_MS = 30000;
