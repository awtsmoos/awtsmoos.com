// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppShell
 * @description
 * One horizon, context ribbon, dock, and universal Torah-discussion doorway surround Awtsmoos.com.
 * The Awtsmoos lets compact navigation reveal chosen essentials while the full constellation keeps every chamber near.
 */
import { mountUniversalChat } from '../universalChat/bootstrap.js';
import { currentAppRoute, dockRoutes } from './appRoutes.js';
import { createContextRibbon } from './contextRibbon.js';
import { isCanonicalRouteLink } from './routeCurrentState.js';
import { createMalchusRouteLink } from './routeLink.js';
import { createUnusualHeader } from './unusualHeader.js';

const CURRENT_ROUTE_OWNER = 'shell';
const ROUTE_LINK_SELECTOR = 'a[data-g-route-link]';

/** Adds the canonical shell without replacing route content. */
export function ensureAppShell(root = document) {
	if (!root.body) {
		return null;
	}
	const existingShell = root.querySelector('[data-g-shell]');
	if (existingShell) {
		mountChatInShell(existingShell);
		return existingShell;
	}
	const malchusShell = root.createElement('div');
	malchusShell.className = 'g-shell';
	malchusShell.dataset.gShell = 'true';
	malchusShell.append(
		createUnusualHeader(root),
		createContextRibbon(root),
		createDock(root)
	);
	root.body.prepend(malchusShell);
	mountChatInShell(malchusShell);
	markCurrentLinks(root);
	return malchusShell;
}

/** Mounts the singleton universal-chat launcher inside the shared header actions. */
function mountChatInShell(shell) {
	const actions = shell.querySelector('.g-header-actions');
	mountUniversalChat({
		mount: actions || undefined
	});
}

/** Synchronizes current state only inside shell-owned route links. */
export function markCurrentLinks(root = document) {
	const currentRoute = currentAppRoute();
	const pageHref = currentPageHref();
	for (const link of root.querySelectorAll(ROUTE_LINK_SELECTOR)) {
		markOneRouteLink(link, currentRoute.href, pageHref);
	}
}

/** Applies or clears shell-owned aria-current state for one route link. */
function markOneRouteLink(link, currentHref, pageHref) {
	const selected = isCanonicalRouteLink(link.href, currentHref, pageHref);
	if (selected) {
		link.setAttribute('aria-current', 'page');
		link.dataset.gRouteCurrent = CURRENT_ROUTE_OWNER;
		return;
	}
	if (link.dataset.gRouteCurrent === CURRENT_ROUTE_OWNER) {
		link.removeAttribute('aria-current');
		delete link.dataset.gRouteCurrent;
	}
}

/** Creates the compact dock from routes explicitly chosen for repeated daily movement. */
function createDock(root) {
	const dock = root.createElement('nav');
	dock.className = 'g-dock';
	dock.setAttribute('aria-label', 'Primary Geelooy routes');
	for (const route of dockRoutes) {
		dock.append(createMalchusRouteLink(root, route, 'dock'));
	}
	return dock;
}

/** Returns the current absolute page href without assuming a browser during tests. */
function currentPageHref() {
	if (typeof location === 'undefined') {
		return 'https://awtsmoos.com/';
	}
	return location.href;
}
