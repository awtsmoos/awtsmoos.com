// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppRoutes
 * @description
 * One route covenant for Awtsmoos.com. The Awtsmoos renews each chamber
 * independently while this map keeps navigation ownership singular and true.
 */
export const appRoutes = Object.freeze([
	{ href: '/', label: 'Home', icon: '⌂', group: 'primary', description: 'Your feed and creative dashboard.', match: exact('/') },
	{ href: '/heichelos', label: 'Spaces', icon: '◈', group: 'primary', description: 'Communities, libraries, and series.', match: prefix('/heichelos', ['/heichelos/submit']) },
	{ href: '/heichelos/submit', label: 'Create', icon: '+', group: 'primary', create: true, description: 'Publish a post or open a creative flow.', match: starts('/heichelos/submit') },
	{ href: '/email', label: 'Mail', icon: '✉', group: 'primary', description: 'Messages and live conversations.', match: starts('/email') },
	{ href: '/profile', label: 'Profile', icon: '◎', group: 'primary', description: 'Aliases, spaces, and settings.', match: starts('/profile') },
	{ href: '/mawgawl/sefarim', label: 'Search', icon: '⌕', group: 'discover', description: 'Search Torah, posts, and source ranges.', match: starts('/mawgawl/sefarim') },
	{ href: '/notifications', label: 'Signals', icon: '◉', group: 'discover', description: 'Comments, mentions, and activity.', match: starts('/notifications') },
	{ href: '/apps', label: 'Apps', icon: '▦', group: 'discover', description: 'Creative tools and Awtsmoos utilities.', match: starts('/apps') },
	{ href: '/about', label: 'About', icon: '◇', group: 'account', description: 'The idea and purpose behind Geelooy.', match: starts('/about') },
	{ href: '/login', label: 'Sign in', icon: '→', group: 'account', description: 'Open your connected account.', match: starts('/login') },
	{ href: '/register', label: 'Create account', icon: '✦', group: 'account', description: 'Begin with a new account.', match: starts('/register') },
	{ href: '/post-editor', label: 'Post editor', group: 'specialist', hidden: true, match: starts('/post-editor') },
	{ href: '/heichel-editor', label: 'Heichel editor', group: 'specialist', hidden: true, match: starts('/heichel-editor') },
	{ href: '/comment-thread', label: 'Comment thread', group: 'specialist', hidden: true, match: starts('/comment-thread') }
]);

export const primaryRoutes = appRoutes.filter(route => route.group === 'primary');
export const discoveryRoutes = appRoutes.filter(route => route.group === 'discover');
export const accountRoutes = appRoutes.filter(route => route.group === 'account');

/** Finds the route whose path covenant contains the current location. */
export function currentAppRoute(pathname = currentPath()) {
	return appRoutes.find(route => route.match(pathname)) || appRoutes[0];
}

/** Determines whether a pathname belongs to the unified main application. */
export function isMainAppRoute(pathname) {
	return appRoutes.some(route => route.match(normalize(pathname)));
}

/** Filters visible route labels and descriptions for the command doorway. */
export function searchAppRoutes(query = '') {
	const visibleRoutes = appRoutes.filter(route => !route.hidden);
	const needle = String(query).trim().toLowerCase();
	if (!needle) return visibleRoutes;
	return visibleRoutes.filter(route => `${route.label} ${route.description}`.toLowerCase().includes(needle));
}

function currentPath() {
	return typeof location === 'undefined' ? '/' : location.pathname;
}

function normalize(pathname) {
	const path = String(pathname || '/').split(/[?#]/, 1)[0].replace(/\/+$/, '');
	return path || '/';
}

function exact(expected) {
	return pathname => normalize(pathname) === expected;
}

function starts(expected) {
	return pathname => normalize(pathname).startsWith(expected);
}

function prefix(expected, excluded = []) {
	return pathname => starts(expected)(pathname) && !excluded.some(item => starts(item)(pathname));
}
