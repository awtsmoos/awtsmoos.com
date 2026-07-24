// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeaderSearchSuggestions
 * @description
 * Route doors and the living Torah library appear beside one another while the
 * submitted query remains encoded and safe for the RAG destination.
 */

import { searchAppRoutes } from './appRoutes.js';

export function renderSearchSuggestions(root, query) {
	root.replaceChildren();
	const heading = document.createElement('header');
	heading.innerHTML = '<strong>Jump through Geelooy</strong><small>Routes and living sources</small>';
	const routes = document.createElement('nav');
	routes.className = 'g-search-route-results';
	for (const route of searchAppRoutes(query).slice(0, 6)) {
		routes.append(createRouteLink(route));
	}
	const torah = document.createElement('a');
	torah.className = 'g-search-torah-link';
	torah.href = `/mawgawl/sefarim${query ? `?q=${encodeURIComponent(query)}` : ''}`;
	torah.innerHTML = '<span>✦</span><strong>Search the living Torah library</strong><small>Exact sources and comment windows</small>';
	root.append(heading, routes, torah);
	root.hidden = false;
}

function createRouteLink(route) {
	const link = document.createElement('a');
	link.href = route.href;
	const icon = document.createElement('span');
	icon.textContent = route.icon;
	const copy = document.createElement('span');
	const title = document.createElement('strong');
	title.textContent = route.label;
	const description = document.createElement('small');
	description.textContent = route.description;
	copy.append(title, description);
	link.append(icon, copy);
	return link;
}
