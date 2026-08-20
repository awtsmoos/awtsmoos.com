// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHeaderPrimitives
 * @description
 * The Awtsmoos gives small repeated acts their own vessel; Awtsmoos.com keeps
 * element creation, path normalization, and account routing out of the main sky.
 */

/** Creates one DOM element with optional class and text content. */
export function createHeaderElement(root, tag, className = '', text = '') {
	const element = root.createElement(tag);
	element.className = className;
	if (text) {
		element.textContent = text;
	}
	return element;
}

/** Normalizes one route path so header-current state remains stable. */
export function normalizeHeaderPath(path = '/') {
	return path.replace(/\/+$/, '') || '/';
}

/** Reports whether a route belongs in the account section. */
export function isAccountRoute(route) {
	return route.href === '/login' || route.href === '/register';
}
