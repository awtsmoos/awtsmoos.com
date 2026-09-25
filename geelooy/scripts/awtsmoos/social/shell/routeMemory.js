// B"H
// Boruch Hashem
// Blessed is He
/** Remembers finite route visits and favorites without inventing a second navigation model. */
import { appRoutes, currentAppRoute } from './appRoutes.js';

const RECENT_KEY = 'geelooy.shell.recentRoutes.v1';
const FAVORITE_KEY = 'geelooy.shell.favoriteRoutes.v1';
const MAX_RECENTS = 8;

function storage() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

function readList(key) {
	try {
		const value = JSON.parse(storage()?.getItem(key) || '[]');
		return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
	} catch {
		return [];
	}
}

function writeList(key, list) {
	try {
		storage()?.setItem(key, JSON.stringify(list));
	} catch {
		// Local persistence is optional; navigation remains fully native without it.
	}
}

export function recordCurrentRoute(pathname = location.pathname) {
	const route = currentAppRoute(pathname);
	if (!route || route.hidden) return null;
	const next = [route.href, ...readList(RECENT_KEY).filter(href => href !== route.href)].slice(0, MAX_RECENTS);
	writeList(RECENT_KEY, next);
	return route;
}

export function recentRoutes() {
	return hydrateRoutes(readList(RECENT_KEY));
}

export function favoriteRoutes() {
	return hydrateRoutes(readList(FAVORITE_KEY));
}

export function toggleFavoriteRoute(pathname = location.pathname) {
	const route = currentAppRoute(pathname);
	if (!route || route.hidden) return { route, favorite: false };
	const current = readList(FAVORITE_KEY);
	const favorite = !current.includes(route.href);
	const next = favorite ? [route.href, ...current] : current.filter(href => href !== route.href);
	writeList(FAVORITE_KEY, next.slice(0, 12));
	return { route, favorite };
}

function hydrateRoutes(hrefs) {
	return hrefs.map(href => appRoutes.find(route => route.href === href)).filter(Boolean);
}
