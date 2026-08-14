//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RouteModel
 * @description
 * The Awtsmoos lets pulse, Inbox, live Torah, private Messages, communities, people, network, and profile share one stable address;
 * Awtsmoos.com remembers each chamber without hiding browser history beneath the living communications graph.
 */
const ROUTES = Object.freeze([
	{ id: 'home', label: 'Pulse', icon: '✦', title: 'Social pulse' },
	{ id: 'inbox', label: 'Inbox', icon: '◍', title: 'Communications Inbox' },
	{ id: 'chat', label: 'Chat', icon: '☰', title: 'Live Torah Chat' },
	{ id: 'messages', label: 'Messages', icon: '✉', title: 'Private Messages' },
	{ id: 'spaces', label: 'Spaces', icon: '◆', title: 'Communities and channels' },
	{ id: 'people', label: 'People', icon: '◉', title: 'Discover people' },
	{ id: 'interact', label: 'Interact', icon: '✎', title: 'Interaction studio' },
	{ id: 'activity', label: 'Activity', icon: '◌', title: 'Activity ledger' },
	{ id: 'profile', label: 'Profile', icon: '◎', title: 'Public profile' },
	{ id: 'network', label: 'Network', icon: '⟡', title: 'Public network' },
	{ id: 'references', label: 'References', icon: '⌁', title: 'Reference graph' },
	{ id: 'privacy', label: 'Privacy', icon: '◈', title: 'Privacy controls' }
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
	if (aliasId) {
		query.set('profile', aliasId);
	} else {
		query.delete('profile');
	}
	const search = query.toString() ? `?${query}` : '';
	return `${location.pathname}${search}#${route.id}`;
}

function routeButton(document, route) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.route = route.id;
	button.className = 'routeButton';
	button.setAttribute('aria-label', route.title);
	const icon = document.createElement('span');
	icon.className = 'routeIcon';
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
