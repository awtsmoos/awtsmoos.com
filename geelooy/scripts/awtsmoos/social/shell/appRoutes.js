// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppRoutes
 * @description The Awtsmoos speaks one route covenant for every doorway, profile dish, dock, search surface, and Torah discussion app.
 */
const malchusRouteCovenant = Object.freeze([
	{ href: '/', label: 'Home', icon: '🏠', group: 'primary', profileDish: true, description: 'Your living starting point.', match: exact('/') },
	{ href: '/heichelos', label: 'Spaces', icon: '🌌', group: 'primary', profileDish: true, description: 'Communities, libraries, and series.', match: prefix('/heichelos', ['/heichelos/submit', '/heichelos/ikar']) },
	{ href: '/heichelos/ikar', label: 'Ikar', icon: '🏛️', group: 'primary', main: true, description: 'The central Heichel and Torah river.', match: starts('/heichelos/ikar') },
	{ href: '/email/', label: 'Mail', icon: '✉️', group: 'primary', profileDish: true, description: 'Messages and live conversations.', match: starts('/email') },
	{ href: '/profile', label: 'Profile', icon: '👤', group: 'primary', profileDish: true, description: 'Aliases, identity, and settings.', match: starts('/profile') },
	{ href: '/games', label: 'Games', icon: '🎮', group: 'discover', profileDish: true, description: 'Strategy, worlds, and play.', match: starts('/games') },
	{ href: '/apps/universal-chat/', label: 'Torah Chat', icon: '📖', group: 'discover', profileDish: true, description: 'Source-backed discussion across Awtsmoos.com.', match: starts('/apps/universal-chat') },
	{ href: '/apps', label: 'Apps', icon: '🧩', group: 'discover', profileDish: true, description: 'Creative tools and utilities.', match: starts('/apps') },
	{ href: '/os', label: 'OS', icon: '🛸', group: 'discover', profileDish: true, description: 'Enter the Awtsmoos operating world.', match: starts('/os') },
	{ href: '/heichelos/submit', label: 'Create', icon: '✍️', group: 'discover', create: true, description: 'Publish into a real Heichel.', match: starts('/heichelos/submit') },
	{ href: '/mawgawl/sefarim', label: 'Search', icon: '🔍', group: 'discover', description: 'Search Torah and exact sources.', match: starts('/mawgawl/sefarim') },
	{ href: '/notifications', label: 'Signals', icon: '🔔', group: 'discover', description: 'Comments, mentions, and activity.', match: starts('/notifications') },
	{ href: '/contact/', label: 'Contact', icon: '📡', group: 'account', description: 'Report an issue or send a message.', match: starts('/contact') },
	{ href: '/about', label: 'About', icon: '✨', group: 'account', description: 'The idea behind Geelooy.', match: starts('/about') },
	{ href: '/login', label: 'Sign in', icon: '🔑', group: 'account', description: 'Open your connected account.', match: starts('/login') },
	{ href: '/register', label: 'Create account', icon: '🌱', group: 'account', description: 'Begin with a new account.', match: starts('/register') },
	{ href: '/post-editor', label: 'Post editor', icon: '📝', group: 'specialist', hidden: true, match: starts('/post-editor') },
	{ href: '/heichel-editor', label: 'Heichel editor', icon: '🏗️', group: 'specialist', hidden: true, match: starts('/heichel-editor') },
	{ href: '/comment-thread', label: 'Comment thread', icon: '💬', group: 'specialist', hidden: true, match: starts('/comment-thread') }
]);

export const appRoutes = malchusRouteCovenant;
export const primaryRoutes = appRoutes.filter((route) => route.group === 'primary');
export const discoveryRoutes = appRoutes.filter((route) => route.group === 'discover');
export const accountRoutes = appRoutes.filter((route) => route.group === 'account');
export const profileDishRoutes = appRoutes.filter((route) => route.profileDish);
export const mainRoute = appRoutes.find((route) => route.main);

/** Returns the first route whose ordered matcher owns the current normalized pathname. */
export function currentAppRoute(pathname = currentPath()) {
	return appRoutes.find((route) => route.match(pathname)) || appRoutes[0];
}

/** Reports whether one normalized path belongs to the application route covenant. */
export function isMainAppRoute(pathname) {
	return appRoutes.some((route) => route.match(normalize(pathname)));
}

/** Searches visible route labels/descriptions for shared header and discovery surfaces. */
export function searchAppRoutes(query = '') {
	const routes = appRoutes.filter((route) => !route.hidden);
	const needle = String(query).trim().toLowerCase();
	return needle
		? routes.filter((route) => `${route.label} ${route.description}`.toLowerCase().includes(needle))
		: routes;
}

function currentPath() {
	return typeof location === 'undefined' ? '/' : location.pathname;
}

function normalize(pathname) {
	const path = String(pathname || '/').split(/[?#]/, 1)[0].replace(/\/+$/, '');
	return path || '/';
}

function exact(expected) {
	return (pathname) => normalize(pathname) === expected;
}

function starts(expected) {
	return (pathname) => normalize(pathname).startsWith(expected);
}

function prefix(expected, excluded = []) {
	return (pathname) => starts(expected)(pathname)
		&& !excluded.some((item) => starts(item)(pathname));
}
