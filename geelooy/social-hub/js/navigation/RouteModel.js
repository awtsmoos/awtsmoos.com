//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../ui/IconCatalog.js';

/**
 * @module RouteModel
 * @description
 * The Awtsmoos lets many social chambers remain one reachable current, while Awtsmoos.com gives each destination a concise symbol, short visible name, and complete accessible title;
 * primary roads stay immediately visible, rarer studios become quieter secondary vessels, and browser history remains the truthful spine beneath the light.
 */
const ROUTES = Object.freeze([
	{ id: 'home', label: 'Pulse', icon: hubIcon('home'), title: 'Social pulse', tier: 'primary' },
	{ id: 'inbox', label: 'Inbox', icon: hubIcon('inbox'), title: 'Communications Inbox', tier: 'primary' },
	{ id: 'messages', label: 'DMs', icon: hubIcon('messages'), title: 'Private Messages', tier: 'primary' },
	{ id: 'spaces', label: 'Spaces', icon: hubIcon('spaces'), title: 'Communities and channels', tier: 'primary' },
	{ id: 'people', label: 'People', icon: hubIcon('people'), title: 'Discover people', tier: 'primary' },
	{ id: 'profile', label: 'Me', icon: hubIcon('profile'), title: 'Public profile', tier: 'primary' },
	{ id: 'chat', label: 'Chat', icon: hubIcon('chat'), title: 'Live Torah Chat', tier: 'secondary' },
	{ id: 'interact', label: 'Create', icon: hubIcon('interact'), title: 'Interaction studio', tier: 'secondary' },
	{ id: 'activity', label: 'Activity', icon: hubIcon('activity'), title: 'Activity ledger', tier: 'secondary' },
	{ id: 'network', label: 'Network', icon: hubIcon('network'), title: 'Public network', tier: 'secondary' },
	{ id: 'references', label: 'Links', icon: hubIcon('references'), title: 'Reference graph', tier: 'secondary' },
	{ id: 'privacy', label: 'Privacy', icon: hubIcon('privacy'), title: 'Privacy controls', tier: 'secondary' }
]);

function routeById(id) {
	return ROUTES.find(route => route.id === id) || ROUTES[0];
}

function routeFromLocation(location = window.location) {
	return routeById(String(location.hash || '').replace(/^#/, ''));
}

function profileAliasFromLocation(location = window.location) {
	const query = new URLSearchParams(location.search || '');
	return String(query.get('profile') || query.get('alias') || '');
}

function routeUrl(id, location = window.location) {
	const route = routeById(id);
	return `${location.pathname}${location.search || ''}#${route.id}`;
}

function profileRouteUrl(aliasId, routeId = 'profile', location = window.location) {
	const route = routeById(routeId);
	const query = new URLSearchParams(location.search || '');
	aliasId ? query.set('profile', aliasId) : query.delete('profile');
	const search = query.toString() ? `?${query}` : '';
	return `${location.pathname}${search}#${route.id}`;
}

function routeButton(document, route) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.route = route.id;
	button.dataset.tier = route.tier;
	button.className = 'routeButton';
	button.setAttribute('aria-label', route.title);
	button.title = route.title;
	const icon = document.createElement('span');
	icon.className = 'routeIcon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = route.icon;
	const label = document.createElement('span');
	label.className = 'routeLabel';
	label.textContent = route.label;
	button.append(icon, label);
	return button;
}

export {
	ROUTES,
	profileAliasFromLocation,
	profileRouteUrl,
	routeById,
	routeButton,
	routeFromLocation,
	routeUrl
};
