// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppRouteDefinitions
 * @description
 * The Awtsmoos names each chamber before navigation begins; Awtsmoos.com keeps
 * route identity, dock intent, and discovery depth separate so abundance stays clear.
 */
import {
	exactMatch,
	filteredPrefixMatch,
	startsWithMatch
} from './routeMatchers.js';

export const malchusRouteCovenant = Object.freeze([
	route('/', 'Home', '🏠', 'primary', 'Your living starting point.', { dock: true, profileDish: true, match: exactMatch('/') }),
	route('/heichelos', 'Spaces', '🌌', 'primary', 'Communities, libraries, and series.', { dock: true, profileDish: true, match: filteredPrefixMatch('/heichelos', ['/heichelos/submit', '/heichelos/ikar']) }),
	route('/social-hub', 'Social', '💬', 'primary', 'Post, comment, connect, and trace activity.', { dock: true, match: startsWithMatch('/social-hub') }),
	route('/heichelos/ikar', 'Ikar', '🏛️', 'primary', 'The central Heichel and Torah river.', { main: true, match: startsWithMatch('/heichelos/ikar') }),
	route('/email', 'Mail', '✉️', 'primary', 'Messages and live conversations.', { profileDish: true, match: startsWithMatch('/email') }),
	route('/profile', 'Profile', '👤', 'primary', 'Aliases, identity, and settings.', { dock: true, profileDish: true, match: startsWithMatch('/profile') }),
	route('/mawgawl/sefarim', 'Search', '🔍', 'discover', 'Search Torah and exact sources.', { dock: true, match: startsWithMatch('/mawgawl/sefarim') }),
	route('/notifications', 'Signals', '🔔', 'discover', 'Comments, mentions, and activity.', { match: startsWithMatch('/notifications') }),
	route('/apps/universal-chat/', 'Torah Chat', '📖', 'discover', 'Source-backed discussion across Awtsmoos.com.', { profileDish: true, match: startsWithMatch('/apps/universal-chat') }),
	{ href: '/games', label: 'Games', icon: '🎮', group: 'discover', profileDish: true, description: 'Strategy, worlds, and play.', match: startsWithMatch('/games') },
	route('/apps', 'Apps', '🧩', 'discover', 'Creative tools and utilities.', { profileDish: true, match: startsWithMatch('/apps') }),
	route('/os', 'OS', '🛸', 'discover', 'Enter the Awtsmoos operating world.', { profileDish: true, match: startsWithMatch('/os') }),
	route('/heichelos/submit', 'Create', '✍️', 'discover', 'Publish into a real Heichel.', { create: true, match: startsWithMatch('/heichelos/submit') }),
	route('/contact/', 'Contact', '📡', 'account', 'Report an issue or send a message.', { match: startsWithMatch('/contact') }),
	route('/about', 'About', '✨', 'account', 'The idea behind Geelooy.', { match: startsWithMatch('/about') }),
	route('/login', 'Sign in', '🔑', 'account', 'Open your connected account.', { match: startsWithMatch('/login') }),
	route('/register', 'Create account', '🌱', 'account', 'Begin with a new account.', { match: startsWithMatch('/register') }),
	route('/post-editor', 'Post editor', '📝', 'specialist', '', { hidden: true, match: startsWithMatch('/post-editor') }),
	route('/heichel-editor', 'Heichel editor', '🏗️', 'specialist', '', { hidden: true, match: startsWithMatch('/heichel-editor') }),
	route('/comment-thread', 'Comment thread', '💬', 'specialist', '', { hidden: true, match: startsWithMatch('/comment-thread') })
]);

/** Creates one immutable-shape route record while preserving optional flags. */
function route(href, label, icon, group, description, options = {}) {
	return {
		href,
		label,
		icon,
		group,
		description,
		...options
	};
}
