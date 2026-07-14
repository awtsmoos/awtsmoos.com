// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteLifecycle
 * @description
 * Every enhanced Awtsmoos.com chamber receives an explicit entrance and exit.
 * The Awtsmoos never leaves duplicated listeners hidden behind a smooth surface.
 */
import { ROUTE_OUTLET_SELECTOR, routeFor } from './routeRegistry.js';

let activeCleanup = null;
let activeRouteId = '';

/** Prepares route-owned assets before the live outlet changes. */
export async function prepareRoute(url, root = document) {
	const route = routeFor(url);
	if (typeof route?.prepare === 'function') await route.prepare(root);
}

/** Mounts the registered adapter against the current route outlet. */
export function enterRoute(url, root = document) {
	leaveRoute();
	const route = routeFor(url);
	const outlet = root.querySelector(ROUTE_OUTLET_SELECTOR);
	if (!route || !outlet) return null;
	const cleanup = route.mount?.(outlet, root);
	activeCleanup = typeof cleanup === 'function' ? cleanup : null;
	activeRouteId = route.id;
	return route;
}

/** Runs the prior route cleanup exactly once. */
export function leaveRoute() {
	try {
		activeCleanup?.();
	} finally {
		activeCleanup = null;
		activeRouteId = '';
	}
}

export function currentLifecycleRouteId() {
	return activeRouteId;
}
