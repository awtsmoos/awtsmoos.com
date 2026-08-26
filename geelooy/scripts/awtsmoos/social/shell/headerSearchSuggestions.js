//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeaderSearchSuggestions
 * @description
 * The Awtsmoos reveals real routes and the living Torah library without inventing a second index;
 * Awtsmoos.com keeps every suggestion styled, semantic, encoded, and honest even when no route matches the finite text.
 */

import { searchAppRoutes } from './appRoutes.js';

/**
 * Rebuilds the suggestion surface from canonical route data and the real Torah destination.
 * @param {HTMLElement} root - Live suggestion surface owned by the shared search form.
 * @param {string} query - User-entered search text.
 * @returns {{ routeCount: number, resultCount: number }} Rendered result counts for tests and diagnostics.
 */
export function renderSearchSuggestions(root, query) {
	const documentRoot = root.ownerDocument || document;
	const normalizedQuery = String(query || '').trim();
	const routeMatches = searchAppRoutes(normalizedQuery).slice(0, 6);
	root.replaceChildren();
	root.append(createHeading(documentRoot, routeMatches.length));
	const routes = documentRoot.createElement('nav');
	routes.className = 'g-search-route-results';
	routes.setAttribute('aria-label', 'Geelooy route results');
	if (routeMatches.length) {
		for (const route of routeMatches) routes.append(createRouteLink(documentRoot, route));
	} else {
		routes.append(createEmptyState(documentRoot, normalizedQuery));
	}
	root.append(routes, createTorahLink(documentRoot, normalizedQuery));
	root.hidden = false;
	root.dataset.routeCount = String(routeMatches.length);
	return { routeCount: routeMatches.length, resultCount: routeMatches.length + 1 };
}

function createHeading(documentRoot, routeCount) {
	const heading = documentRoot.createElement('header');
	const title = documentRoot.createElement('strong');
	title.textContent = 'Jump through Geelooy';
	const meta = documentRoot.createElement('small');
	meta.textContent = routeCount
		? `${routeCount} route${routeCount === 1 ? '' : 's'} + Torah`
		: 'Torah search remains available';
	heading.append(title, meta);
	return heading;
}

function createRouteLink(documentRoot, route) {
	const link = documentRoot.createElement('a');
	link.href = route.href;
	link.dataset.searchResult = 'route';
	link.setAttribute('aria-label', `${route.label}: ${route.description}`);
	const icon = documentRoot.createElement('span');
	icon.className = 'g-search-result-icon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = route.icon;
	const copy = documentRoot.createElement('span');
	copy.className = 'g-search-result-copy';
	const title = documentRoot.createElement('strong');
	title.textContent = route.label;
	const description = documentRoot.createElement('small');
	description.textContent = route.description;
	copy.append(title, description);
	link.append(icon, copy);
	return link;
}

function createEmptyState(documentRoot, query) {
	const empty = documentRoot.createElement('p');
	empty.className = 'g-search-empty';
	empty.textContent = query
		? `No Geelooy route matches “${query}”. Search Torah below or try another route name.`
		: 'No route shortcuts are available right now. Torah search remains below.';
	return empty;
}

function createTorahLink(documentRoot, query) {
	const torah = documentRoot.createElement('a');
	torah.className = 'g-search-torah-link';
	torah.dataset.searchResult = 'torah';
	torah.href = `/mawgawl/sefarim${query ? `?q=${encodeURIComponent(query)}` : ''}`;
	const icon = documentRoot.createElement('span');
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = '✦';
	const copy = documentRoot.createElement('span');
	copy.className = 'g-search-result-copy';
	const title = documentRoot.createElement('strong');
	title.textContent = 'Search the living Torah library';
	const description = documentRoot.createElement('small');
	description.textContent = 'Exact sources and comment windows';
	copy.append(title, description);
	torah.append(icon, copy);
	return torah;
}
