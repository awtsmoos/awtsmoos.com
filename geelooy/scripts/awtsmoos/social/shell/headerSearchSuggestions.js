//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeaderSearchSuggestions
 * @description
 * The Awtsmoos renews remembered places, canonical routes, power help, and Torah in one search doorway;
 * Awtsmoos.com keeps suggestion rendering focused here while route truth and richer power suggestions remain delegated to their own vessels.
 */

import { searchAppRoutes } from './appRoutes.js';
import { createPowerSuggestions } from './headerSearchPowerSuggestions.js';

/** Renders route, power, and Torah continuations for the current header-search query. */
export function renderSearchSuggestions(root, query) {
	const documentRoot = root.ownerDocument || document;
	const normalizedQuery = String(query || '').trim();
	const routeMatches = normalizedQuery === '?'
		? []
		: searchAppRoutes(normalizedQuery).slice(0, 6);

	root.replaceChildren();
	root.append(createHeading(documentRoot, routeMatches.length));

	const power = createPowerSuggestions(documentRoot, normalizedQuery);
	if (power) {
		root.append(power);
	}

	const routes = documentRoot.createElement('nav');
	routes.className = 'g-search-route-results';
	routes.setAttribute('aria-label', 'Geelooy route results');
	if (routeMatches.length) {
		for (const route of routeMatches) {
			routes.append(createRouteLink(documentRoot, route));
		}
	} else if (!power) {
		routes.append(createEmptyState(documentRoot, normalizedQuery));
	}

	root.append(
		routes,
		createTorahLink(documentRoot, normalizedQuery === '?' ? '' : normalizedQuery)
	);
	root.hidden = false;
	root.dataset.routeCount = String(routeMatches.length);
	return {
		routeCount: routeMatches.length,
		resultCount: root.querySelectorAll('[data-search-result]').length
	};
}

/** Builds the compact suggestion heading and current route count. */
function createHeading(documentRoot, routeCount) {
	const heading = documentRoot.createElement('header');
	const title = documentRoot.createElement('strong');
	title.textContent = 'Jump through Geelooy';
	const meta = documentRoot.createElement('small');
	meta.textContent = routeCount
		? `${routeCount} route${routeCount === 1 ? '' : 's'} + Torah`
		: 'Remembered places, help, and Torah';
	heading.append(title, meta);
	return heading;
}

/** Renders one canonical app-route result without injecting HTML. */
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

/** Renders one truthful empty route state while Torah search remains available. */
function createEmptyState(documentRoot, query) {
	const empty = documentRoot.createElement('p');
	empty.className = 'g-search-empty';
	empty.textContent = query
		? `No Geelooy route matches “${query}”. Search Torah below or try another route name.`
		: 'No route shortcuts are available right now.';
	return empty;
}

/** Builds the canonical continuation into the full living Torah search surface. */
function createTorahLink(documentRoot, query) {
	const torah = documentRoot.createElement('a');
	torah.className = 'g-search-torah-link';
	torah.dataset.searchResult = 'torah';
	torah.href = `/mawgawl/sefarim${query ? `?q=${encodeURIComponent(query)}` : ''}`;

	const title = documentRoot.createElement('strong');
	title.textContent = '✦ Search the living Torah library';
	const description = documentRoot.createElement('small');
	description.textContent = 'Exact sources and comment windows';
	torah.append(title, description);
	return torah;
}
