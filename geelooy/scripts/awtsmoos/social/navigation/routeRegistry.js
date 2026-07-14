// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHybridRouteRegistry
 * @description
 * The Awtsmoos renews every Awtsmoos.com page while this narrow covenant names
 * only routes whose mount and unmount lives have actually been mapped.
 */
import { aboutRouteAdapter } from './adapters/aboutRoute.js';
import { appsRouteAdapter } from './adapters/appsRoute.js';

export const ROUTE_OUTLET_SELECTOR = '[data-geelooy-route-outlet]';

const routes = new Map([
	['/about', aboutRouteAdapter],
	['/apps', appsRouteAdapter]
]);

export const hybridRoutePaths = Object.freeze(Array.from(routes.keys()));

/** Returns the registered adapter for an exact route pathname. */
export function routeFor(value, base = defaultBase()) {
	try {
		const url = value instanceof URL ? value : new URL(String(value), base);
		return routes.get(normalizeRoutePath(url.pathname)) || null;
	} catch {
		return null;
	}
}

/** Reports whether a URL belongs to the proven hybrid corridor. */
export function isHybridRoute(value, base = defaultBase()) {
	return Boolean(routeFor(value, base));
}

/** Normalizes only harmless trailing slashes; no prefix becomes eligible. */
export function normalizeRoutePath(pathname = '/') {
	const normalized = String(pathname || '/').replace(/\/+$/, '');
	return normalized || '/';
}

function defaultBase() {
	return globalThis.location?.href || 'http://localhost/';
}
