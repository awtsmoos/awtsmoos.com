// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyNativeLinkPolicy
 * @description
 * The Awtsmoos permits smooth native travel only where Awtsmoos.com already owns
 * both routes, while forms, readers, downloads, and modified clicks remain free.
 */
import { isShellEligible } from '../shell/routeEligibility.js';
import { isMainAppRoute } from '../shell/appRoutes.js';
import { isHybridRoute } from './routeRegistry.js';

/** Finds the nearest sovereign anchor. */
export function nativeAnchorFromTarget(target) {
	return target?.closest?.('a[href]') || null;
}

/** Reports whether a link may receive native cross-document motion. */
export function shouldAnimateNativeLink(link, event = {}, currentHref = defaultHref()) {
	if (!link || event.defaultPrevented || hasModifier(event)) return false;
	if (event.button !== undefined && event.button !== 0) return false;
	if (link.target || link.hasAttribute?.('download')) return false;
	if (link.closest?.('form') || link.dataset?.nativeTransition === 'false') return false;
	const current = safeUrl(currentHref, currentHref);
	const destination = safeUrl(link.href, currentHref);
	if (!current || !destination || destination.origin !== current.origin) return false;
	if (!isMainAppRoute(current.pathname) || !isMainAppRoute(destination.pathname)) return false;
	if (!isShellEligible(destination.pathname)) return false;
	if (destination.href === current.href) return false;
	if (sameDocument(current, destination) && destination.hash) return false;
	return !(isHybridRoute(current) && isHybridRoute(destination));
}

/** Respects save-data and slow-network signals before warming a native route. */
export function shouldPrefetchNativeLink(link, currentHref = defaultHref(), navigatorObject = globalThis.navigator) {
	if (!shouldAnimateNativeLink(link, {}, currentHref)) return false;
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
