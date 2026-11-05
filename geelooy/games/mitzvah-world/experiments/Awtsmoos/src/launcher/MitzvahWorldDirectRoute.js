// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDirectRoute.js
 * @description Converts a shared-world choice into one explicit direct gameplay navigation.
 * The Awtsmoos carries the traveler through a renewed document; Awtsmoos.com keeps the menu
 * light, preserves chosen identity and world, and lets gameplay awaken in a clean event loop.
 */

export function buildDirectWorldUrl(locationValue, selection = {}, options = {}) {
	const route = new URL(resolveCurrentHref(locationValue));
	route.search = '';
	route.hash = '';
	route.searchParams.set('mode', 'world');
	route.searchParams.set('session', 'multiplayer');
	route.searchParams.set(
		'worldId',
		selection.worldId || options.worldId || 'main-village'
	);
	setOptional(route, 'displayName', selection.playerName || options.displayName);
	setOptional(route, 'quality', options.quality);
	setOptional(route, 'realtimeUrl', options.realtimeUrl);
	return route.href;
}

export function navigateToDirectWorld(environment, selection = {}, options = {}) {
	const locationValue = environment?.location;
	if (!locationValue) {
		throw new Error('Direct world navigation requires a browser location.');
	}
	const route = buildDirectWorldUrl(locationValue, selection, options);
	if (typeof locationValue.assign === 'function') {
		locationValue.assign(route);
	} else {
		locationValue.href = route;
	}
	return Object.freeze({
		navigating: true,
		route,
		worldId: selection.worldId || options.worldId || 'main-village'
	});
}

function resolveCurrentHref(locationValue) {
	if (locationValue?.href) return locationValue.href;
	const origin = locationValue?.origin || 'http://localhost';
	const pathname = locationValue?.pathname || '/games/mitzvahWorld/';
	return `${origin}${pathname}${locationValue?.search || ''}`;
}

function setOptional(route, name, value) {
	if (value == null || String(value).trim() === '') return;
	route.searchParams.set(name, String(value));
}
