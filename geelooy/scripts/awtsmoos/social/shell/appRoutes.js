// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppRoutes
 * @description
 * The Awtsmoos speaks one Malchus covenant for every doorway on Awtsmoos.com.
 * Header, dock, profile dishes, command search, and route state drink from this
 * single river, so Games enters the kingdom without birthing a shadow kingdom.
 */
const malchusRouteCovenant = Object.freeze([
	{ href: '/', label: 'Home', icon: '🏠', group: 'primary', profileDish: true, description: 'Your feed and creative dashboard.', match: exact('/') },
	{ href: '/heichelos', label: 'Spaces', icon: '🌌', group: 'primary', profileDish: true, description: 'All communities, libraries, and series.', match: prefix('/heichelos', ['/heichelos/submit', '/heichelos/ikar']) },
	{ href: '/heichelos/ikar', label: 'Ikar', icon: '🏛️', group: 'primary', main: true, description: 'Enter the central Heichel and its living Torah river.', match: starts('/heichelos/ikar') },
	{ href: '/email', label: 'Mail', icon: '📬', group: 'primary', profileDish: true, description: 'Messages and live conversations.', match: starts('/email') },
	{ href: '/profile', label: 'Profile', icon: '👤', group: 'primary', description: 'Aliases, Heichelos, and settings.', match: starts('/profile') },
	{ href: '/games', label: 'Games', icon: '🎮', group: 'discover', profileDish: true, description: 'Enter the arcade of sparks, strategy, worlds, and play.', match: starts('/games') },
	{ href: '/heichelos/submit', label: 'Create', icon: '✍️', group: 'discover', create: true, description: 'Publish a post into a real Heichel.', match: starts('/heichelos/submit') },
	{ href: '/mawgawl/sefarim', label: 'Search', icon: '🔍', group: 'discover', description: 'Search Torah, posts, and exact source ranges.', match: starts('/mawgawl/sefarim') },
	{ href: '/notifications', label: 'Signals', icon: '🔔', group: 'discover', description: 'Comments, mentions, and activity.', match: starts('/notifications') },
	{ href: '/apps', label: 'Apps', icon: '🧰', group: 'discover', profileDish: true, description: 'Creative tools and Awtsmoos utilities.', match: starts('/apps') },
	{ href: '/about', label: 'About', icon: '✨', group: 'account', description: 'The idea and purpose behind Geelooy.', match: starts('/about') },
	{ href: '/login', label: 'Sign in', icon: '🔑', group: 'account', description: 'Open your connected account.', match: starts('/login') },
	{ href: '/register', label: 'Create account', icon: '🌱', group: 'account', description: 'Begin with a new account.', match: starts('/register') },
	{ href: '/post-editor', label: 'Post editor', icon: '📝', group: 'specialist', hidden: true, match: starts('/post-editor') },
	{ href: '/heichel-editor', label: 'Heichel editor', icon: '🏗️', group: 'specialist', hidden: true, match: starts('/heichel-editor') },
	{ href: '/comment-thread', label: 'Comment thread', icon: '💬', group: 'specialist', hidden: true, match: starts('/comment-thread') }
]);

export const appRoutes = malchusRouteCovenant;
export const primaryRoutes = appRoutes.filter(route => route.group === 'primary');
export const discoveryRoutes = appRoutes.filter(route => route.group === 'discover');
export const accountRoutes = appRoutes.filter(route => route.group === 'account');
export const profileDishRoutes = appRoutes.filter(route => route.profileDish);
export const mainRoute = appRoutes.find(route => route.main);

/** Reveals the route vessel whose boundary contains the current path. */
export function currentAppRoute(pathname = currentPath()) {
	return appRoutes.find(route => route.match(pathname)) || appRoutes[0];
}

/** Determines whether a path belongs to the unified Awtsmoos.com application. */
export function isMainAppRoute(pathname) {
	return appRoutes.some(route => route.match(normalize(pathname)));
}

/** Searches visible routes through one label-and-description covenant. */
export function searchAppRoutes(query = '') {
	const visibleRoutes = appRoutes.filter(route => !route.hidden);
	const chochmahNeedle = String(query).trim().toLowerCase();
	if (!chochmahNeedle) {
		return visibleRoutes;
	}
	return visibleRoutes.filter(route => {
		return `${route.label} ${route.description}`.toLowerCase().includes(chochmahNeedle);
	});
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
