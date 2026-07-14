// B"H
// Boruch Hashem
// Blessed is He
/** @module ReleaseRoutes @description Maps proven repository families into independent review trains. */

const ROUTES = Object.freeze([
	['social', [
		'geelooy/social-composer/',
		'geelooy/api/social/',
		'geelooy/scripts/awtsmoos/social/',
		'geelooy/heichel/',
		'geelooy/heichelos/',
		'geelooy/heichel-review/',
		'geelooy/style/heichelos/'
	]],
	['search', [
		'ayzarim/dosdb/',
		'geelooy/mawgawl/',
		'geelooy/apps/sefarim/'
	]],
	['tunnel', [
		'ayzarim/awtsmoosdynamicserver/tunnel/',
		'awtsmoos/'
	]],
	['artifacts', [
		'geelooy/apps/android-emulator/',
		'geelooy/apps/exe-emulator/',
		'geelooy/scripts/awtsmoos/compiling/',
		'geelooy/shared/compiling/',
		'geelooy/shared/workspace/',
		'geelooy/os/test/',
		'geelooy/os/programs/awtsmoos-executable/',
		'geelooy/os/programs/awtsmoos-file-explorer/',
		'geelooy/os/basicprograms.js'
	]],
	['worlds', [
		'geelooy/games/shema-strike/',
		'ayzarim/awtsmoosdynamicserver/websocket/apps/shemastrike/'
	]],
	['characters', [
		'geelooy/games/scribe-journey/',
		'ayzarim/awtsmoosdynamicserver/websocket/apps/scribejourney/'
	]],
	['replays', [
		'geelooy/games/mitzvahworld/',
		'geelooy/games/city-of-light/',
		'geelooy/games/sefira-clash/',
		'ayzarim/awtsmoosdynamicserver/websocket/apps/mitzvahworld/',
		'ayzarim/awtsmoosdynamicserver/websocket/apps/sefiraclash/'
	]],
	['integration', [
		'geelooy/platform/creator-world-os/',
		'geelooy/style/geelooy-app/',
		'geelooy/games/scripts/',
		'tests/geelooy/',
		'ayzarim/awtsmoosdynamicserver/awtsmoossocket.js',
		'ayzarim/awtsmoosdynamicserver/server/',
		'ayzarim/awtsmoosdynamicserver/websocket/core/',
		'ayzarim/awtsmoosdynamicserver/websocket/platform/',
		'ayzarim/tools/',
		'browser-evidence'
	]]
]);

/** Assigns a path to a release train or leaves it explicit as unrouted. */
export function assignReleaseTrain(pathname) {
	const path = normalizePath(pathname);
	for (const [trainId, prefixes] of ROUTES) {
		if (prefixes.some(prefix => path.startsWith(prefix))) {
			return trainId;
		}
	}
	return 'unrouted';
}

/** Returns a frozen inspectable route map. */
export function releaseRouteMap() {
	return Object.freeze(ROUTES.map(([trainId, prefixes]) => Object.freeze({
		trainId,
		prefixes: Object.freeze([...prefixes])
	})));
}

function normalizePath(value) {
	return String(value || '').trim().toLowerCase().replaceAll('\\', '/').replace(/^\.\//, '');
}
