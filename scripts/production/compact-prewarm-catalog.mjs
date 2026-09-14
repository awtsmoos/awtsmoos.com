//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file compact-prewarm-catalog.mjs
 * @description
 * Release-critical HTML routes and generated CompactJS doors that must be hot
 * before public traffic can make a visitor pay compilation cost.
 */

/**
 * Freezes one critical route and every deferred compact asset it owns.
 * @param {string} name Human-readable release identity.
 * @param {string} path Same-origin HTML path.
 * @param {string[]} [assets] Compact assets not guaranteed to appear in HTML.
 * @returns {Readonly<object>} Immutable route declaration.
 */
function criticalRoute(name, path, assets = []) {
	return Object.freeze({
		name,
		path,
		assets: Object.freeze([...assets])
	});
}

const IKAR_APP = "/heichelos/heichel/app.js?v=ikar-authority-008&compact=true";
const IKAR_SHELL = "/scripts/awtsmoos/social/shell/boot.js?v=heichel-mobile-010&compact=true";
const IKAR_SOCIAL = "/shared/social/SocialExperienceInstaller.js?compact=true";
const IKAR_NAVIGATION = "/scripts/awtsmoos/social/navigation/appNavigation.js?v=heichel-mobile-010&compact=true";
const IKAR_COSMOS = "/heichelos/heichel/modules/cosmic/boot.js?v=heichel-mobile-010&compact=true";
const READER_POST = "/heichelos/ikar/series/bereishis/post/BH_POST_1749198302925_awtsmoos_520";
const READER_RUNTIME = "/heichelos/post/postLogic.js?v=reader-runtime-008&compact=true";
const HOME_RUNTIME = "/scripts/home-simple/index.js?v=main-brand-002&compact=true";
const MITZVAH_WORLD_ROOT = "/games/mitzvahWorld/experiments/Awtsmoos/src/";

export const COMPACT_PREWARM_ROUTES = Object.freeze([
	criticalRoute("Awtsmoos Home", "/", [HOME_RUNTIME]),
	criticalRoute("Ikar Torah Library", "/heichelos/ikar", [
		IKAR_APP,
		IKAR_SHELL,
		IKAR_SOCIAL,
		IKAR_NAVIGATION,
		IKAR_COSMOS
	]),
	criticalRoute("Torah Reader", READER_POST, [READER_RUNTIME]),
	criticalRoute(
		"Awtsmoos Home",
		"/"
	),
	criticalRoute(
		"Ikar Torah Library",
		"/heichelos/ikar",
		[
			"/heichelos/heichel/ikar-first.js?v=ikar-first-002&compact=true"
		]
	),
	criticalRoute(
		"Torah Reader",
		"/heichelos/ikar/series/bereishis/0"
	),
	criticalRoute(
		"Mitzvah World",
		"/games/mitzvahWorld/",
		[
			`${MITZVAH_WORLD_ROOT}launcher/MitzvahWorldDeferredLaunchRuntime.js?v=20260827-lightning-launch-02&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/createEretzRuntime.js?compact=true&v=20260804-map-01`,
			`${MITZVAH_WORLD_ROOT}app/EretzFoundationServices.js?v=20260827-responsive-services-01&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzWebGlBootFrame.js?v=20260827-responsive-frame-01&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzEssentialAssetLoader.js?v=20260827-responsive-assets-01&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/BootstrapWorldFoundation.js?v=20260827-responsive-valley-01&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzPostPlayablePriority.js?v=20260820-player-priority-02&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzDistrictStreamingLaunch.js?v=20260820-player-priority-02&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzDeferredEnrichmentLaunch.js?v=20260820-player-priority-02&compact=true`,
			`${MITZVAH_WORLD_ROOT}app/EretzDeferredRuntimeEnrichment.js?v=20260812-canonical-world-promotion-01&compact=true`
		]
	),
	criticalRoute(
		"Temple Runner",
		"/games/mitzvahWorld/templeRunner/"
	),
	criticalRoute(
		"Ohrfront",
		"/games/ohrfront/",
		[
			"/games/ohrfront/src/OhrfrontEntry.js?compact=true&ohrfront-load=8"
		]
	)
]);

export const COMPACT_PREWARM_TIMEOUT_MS = 30000;
