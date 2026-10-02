//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IkarFirst
 * @description
 * The Awtsmoos lets server-rendered Torah geometry remain the living product;
 * Awtsmoos.com enhances that same navigation and discovery without replacing first paint.
 */

import { installIkarSearch } from './ikar-search.js?v=ikar-search-001';

const IKAR_ROOT = '/heichelos/ikar';

/** Enhances the semantic Ikar document in place. */
export function boot() {
	if (!isIkarRoute()) return;

	const root = document.querySelector('[data-heichel-semantic-fallback]');
	if (!root) return;

	document.body.dataset.heichelId = 'ikar';
	document.body.dataset.heichelReady = 'true';
	document.documentElement.dataset.heichelExperience = 'torah-first';
	root.classList.add('ikar-first');
	root.dataset.ikarFirst = 'ready';

	installNavigation(root);

	const discovery = root.querySelector('.heichel-semantic-discovery');
	if (discovery) enhanceDiscovery(root, discovery);
}

/** Returns whether the current document belongs to the public Ikar library. */
function isIkarRoute() {
	return location.pathname === IKAR_ROOT
		|| location.pathname.startsWith(`${IKAR_ROOT}/`);
}

/** Reuses server navigation and creates it only when fallback markup is absent. */
function installNavigation(root) {
	const existing = root.querySelector('[data-ikar-stable-navigation], .ikar-first-actions');
	if (existing) return existing;

	const navigation = document.createElement('nav');
	navigation.className = 'ikar-first-actions';
	navigation.dataset.ikarStableNavigation = '';
	navigation.setAttribute('aria-label', 'Torah navigation');
	navigation.append(
		createLink('/', 'Home'),
		createLink(IKAR_ROOT, 'Torah Library', location.pathname === IKAR_ROOT)
	);
	root.append(navigation);
	return navigation;
}

/** Builds one same-origin anchor and marks the exact active Torah surface. */
function createLink(href, label, isCurrent = false) {
	const link = document.createElement('a');
	link.href = href;
	link.textContent = label;
	if (isCurrent) link.setAttribute('aria-current', 'page');
	return link;
}

/** Rewords discovery and attaches filtering to the already-painted search vessel. */
function enhanceDiscovery(root, discovery) {
	discovery.setAttribute('aria-label', 'Torah library');

	const heading = discovery.querySelector('h2');
	if (heading) {
		heading.textContent = location.pathname === IKAR_ROOT
			? 'Choose what to learn'
			: 'Choose a section';
	}

	const items = [...discovery.querySelectorAll('li')];
	updateReadyStatus(root, items.length);

	if (items.length >= 8) {
		installIkarSearch(root, discovery, items);
	}
}

/** Replaces transitional language with a truthful count from server-rendered links. */
function updateReadyStatus(root, count) {
	const status = root.querySelector('[role="status"]');
	if (!status) return;

	status.textContent = `${count} Torah ${count === 1 ? 'pathway' : 'pathways'} ready.`;
}
