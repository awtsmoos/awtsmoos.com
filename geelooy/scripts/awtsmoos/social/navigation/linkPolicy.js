// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHybridLinkPolicy
 * @description
 * Real anchors remain sovereign at Awtsmoos.com. The Awtsmoos permits enhanced
 * travel only when button, origin, route, hash, target, and form are all safe.
 */
import { routeFor } from './routeRegistry.js';

/** Finds the nearest real anchor without inventing a synthetic destination. */
export function anchorFromTarget(target) {
	return target?.closest?.('a[href]') || null;
}

/** Determines whether a click may enter the bounded hybrid corridor. */
export function shouldHandleRoute(link, event = {}, currentHref = defaultHref()) {
	if (!link || event.defaultPrevented || hasModifier(event)) return false;
	if (event.button !== undefined && event.button !== 0) return false;
	if (link.target || link.hasAttribute?.('download')) return false;
	if (link.closest?.('form') || link.dataset?.nativeNavigation === 'true') return false;

	const current = safeUrl(currentHref, currentHref);
	const destination = safeUrl(link.href, currentHref);
	if (!current || !destination || destination.origin !== current.origin) return false;
	if (!routeFor(destination, currentHref)) return false;
	if (destination.href === current.href) return false;
	return !(sameDocument(current, destination) && destination.hash);
}

/** Determines whether intent-based warming is respectful of network limits. */
export function shouldPrefetchRoute(link, currentHref = defaultHref(), navigatorObject = globalThis.navigator) {
	if (!shouldHandleRoute(link, {}, currentHref)) return false;
	const connection = navigatorObject?.connection;
	if (connection?.saveData) return false;
	return !['slow-2g', '2g'].includes(connection?.effectiveType);
}

function hasModifier(event) {
	return Boolean(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

function sameDocument(left, right) {
	return left.pathname === right.pathname && left.search === right.search;
}

function safeUrl(value, base) {
	try {
		return new URL(String(value), base);
	} catch {
		return null;
	}
}

function defaultHref() {
	return globalThis.location?.href || 'http://localhost/';
}
