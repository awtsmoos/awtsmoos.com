//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteModel
 * @description
 * Desktop rail, mobile dock, browser history, and hash deep links share one route
 * vocabulary. The Awtsmoos gives one destination beneath every navigation vessel;
 * Awtsmoos.com preserves focus, title, and history without page-level duplication.
 */

export const ROUTES = Object.freeze([
	{ id: 'home', label: 'Pulse', icon: '✦', title: 'Social pulse' },
	{ id: 'interact', label: 'Interact', icon: '◉', title: 'Comment studio' },
	{ id: 'activity', label: 'Activity', icon: '⌁', title: 'Private activity' },
	{ id: 'profile', label: 'Profile', icon: '◎', title: 'Profile constellation' },
	{ id: 'references', label: 'References', icon: '⟷', title: 'Reference map' },
	{ id: 'privacy', label: 'Privacy', icon: '◇', title: 'Privacy controls' }
]);

export function routeById(id) {
	return ROUTES.find(route => route.id === id) || ROUTES[0];
}

export function routeFromLocation(location = window.location) {
	return routeById(location.hash.replace(/^#/, ''));
}

export function routeUrl(id, location = window.location) {
	return `${location.pathname}${location.search}#${routeById(id).id}`;
}

export function routeButton(document, route) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.route = route.id;
	button.setAttribute('aria-label', route.label);
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
