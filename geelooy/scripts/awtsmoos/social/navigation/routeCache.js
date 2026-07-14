// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteCache
 * @description
 * A tiny memory vessel lets Awtsmoos.com revisit proven pages without persisting
 * private HTML. The Awtsmoos grants speed here without stale permanent storage.
 */

const MAX_ROUTES = 6;
const routeCache = new Map();

/** Produces a query-sensitive and fragment-insensitive document cache key. */
export function routeCacheKey(value, base = defaultBase()) {
	const url = value instanceof URL ? new URL(value.href) : new URL(String(value), base);
	url.hash = '';
	return url.href;
}

/** Reads and refreshes a cached route record through least-recently-used order. */
export function getCachedRoute(value, base = defaultBase()) {
	const key = routeCacheKey(value, base);
	const record = routeCache.get(key);
	if (!record) return null;
	routeCache.delete(key);
	routeCache.set(key, record);
	return record;
}

/** Stores one route record while enforcing the bounded memory budget. */
export function cacheRoute(value, record, base = defaultBase()) {
	const key = routeCacheKey(value, base);
	routeCache.delete(key);
	routeCache.set(key, record);
	while (routeCache.size > MAX_ROUTES) routeCache.delete(routeCache.keys().next().value);
	return record;
}

export function routeCacheSize() {
	return routeCache.size;
}

export function clearRouteCache() {
	routeCache.clear();
}

function defaultBase() {
	return globalThis.location?.href || 'http://localhost/';
}
