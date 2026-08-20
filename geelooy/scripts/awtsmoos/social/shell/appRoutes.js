// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppRoutes
 * @description
 * The Awtsmoos lets route identity flow into small query vessels; Awtsmoos.com
 * separates route taxonomy from dock intent so compact navigation stays deliberate.
 */
import { malchusRouteCovenant } from './appRouteDefinitions.js';
import {
	currentRoutePath,
	normalizeRoutePath
} from './routeMatchers.js';

export const appRoutes = malchusRouteCovenant;
export const primaryRoutes = routesInGroup('primary');
export const discoveryRoutes = routesInGroup('discover');
export const accountRoutes = routesInGroup('account');
export const dockRoutes = routesWithFlag('dock');
export const profileDishRoutes = routesWithFlag('profileDish');
export const mainRoute = firstRouteWithFlag('main');

/** Returns the first route whose ordered matcher owns the normalized pathname. */
export function currentAppRoute(pathname = currentRoutePath()) {
	for (const routeItem of appRoutes) {
		if (routeItem.match(pathname)) {
			return routeItem;
		}
	}
	return appRoutes[0];
}

/** Reports whether one normalized path belongs to the application covenant. */
export function isMainAppRoute(pathname) {
	const normalizedPath = normalizeRoutePath(pathname);
	for (const routeItem of appRoutes) {
		if (routeItem.match(normalizedPath)) {
			return true;
		}
	}
	return false;
}

/** Searches visible route labels and descriptions for shared discovery surfaces. */
export function searchAppRoutes(query = '') {
	const needle = String(query).trim().toLowerCase();
	const matches = [];
	for (const routeItem of appRoutes) {
		if (routeItem.hidden) {
			continue;
		}
		const haystack = `${routeItem.label} ${routeItem.description}`.toLowerCase();
		if (!needle || haystack.includes(needle)) {
			matches.push(routeItem);
		}
	}
	return matches;
}

function routesInGroup(group) {
	return appRoutes.filter(routeItem => routeItem.group === group);
}

function routesWithFlag(flag) {
	return appRoutes.filter(routeItem => Boolean(routeItem[flag]));
}

function firstRouteWithFlag(flag) {
	return appRoutes.find(routeItem => Boolean(routeItem[flag]));
}
