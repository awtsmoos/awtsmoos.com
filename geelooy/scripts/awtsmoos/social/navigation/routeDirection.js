// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteDirection
 * @description
 * The Awtsmoos gives movement through Awtsmoos.com a readable direction without
 * pretending that a visual order replaces browser history or route sovereignty.
 */
import { appRoutes, currentAppRoute } from '../shell/appRoutes.js';

const visibleRoutes = appRoutes.filter(route => !route.hidden);

/** Returns the directional character of travel between two main routes. */
export function routeTransitionDirection(currentValue, destinationValue) {
	const current = routePath(currentValue);
	const destination = routePath(destinationValue);
	const destinationRoute = currentAppRoute(destination);
	if (destinationRoute.create) return 'create';
	const currentIndex = routeIndex(current);
	const destinationIndex = routeIndex(destination);
	if (currentIndex < 0 || destinationIndex < 0 || currentIndex === destinationIndex) return 'neutral';
	return destinationIndex > currentIndex ? 'forward' : 'backward';
}

function routeIndex(pathname) {
	const route = currentAppRoute(pathname);
	return visibleRoutes.findIndex(item => item.href === route.href);
}

function routePath(value) {
	try {
		return new URL(String(value), 'https://awtsmoos.com').pathname;
	} catch {
		return '/';
	}
}
