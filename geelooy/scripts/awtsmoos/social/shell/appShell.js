// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppShell
 * @description
 * One horizon, context ribbon, and dock surround Awtsmoos.com. The Awtsmoos
 * places every route—including Games—inside one shell and one link renderer,
 * while each native page keeps its sovereign content and performance budget.
 */
import { currentAppRoute, primaryRoutes } from './appRoutes.js';
import { createContextRibbon } from './contextRibbon.js';
import { isCanonicalRouteLink } from './routeCurrentState.js';
import { createMalchusRouteLink } from './routeLink.js';
import { createUnusualHeader } from './unusualHeader.js';

const CURRENT_ROUTE_OWNER = 'shell';
const ROUTE_LINK_SELECTOR = 'a[data-g-route-link]';

/** Adds the canonical shell without replacing route content. */
export function ensureAppShell(root = document) {
	if (!root.body) return null;
	const existing = root.querySelector('[data-g-shell]');
	if (existing) return existing;
	const shell = root.createElement('div');
	shell.className = 'g-shell';
	shell.dataset.gShell = 'true';
	shell.append(createUnusualHeader(root), createContextRibbon(root), createDock(root));
	root.body.prepend(shell);
	markCurrentLinks(root);
	return shell;
}

/** Synchronizes current state only inside shell-owned route links. */
export function markCurrentLinks(root = document) {
	const current = currentAppRoute();
	const pageHref = currentPageHref();
	root.querySelectorAll(ROUTE_LINK_SELECTOR).forEach(link => {
		const selected = isCanonicalRouteLink(link.href, current.href, pageHref);
		if (selected) {
			link.setAttribute('aria-current', 'page');
			link.dataset.gRouteCurrent = CURRENT_ROUTE_OWNER;
			return;
		}
		if (link.dataset.gRouteCurrent === CURRENT_ROUTE_OWNER) {
			link.removeAttribute('aria-current');
			delete link.dataset.gRouteCurrent;
		}
	});
}

function createDock(root) {
	const dock = root.createElement('nav');
	dock.className = 'g-dock';
	dock.setAttribute('aria-label', 'Primary Geelooy routes');
	for (const route of primaryRoutes) {
		dock.append(createMalchusRouteLink(root, route, 'dock'));
	}
	return dock;
}

function currentPageHref() {
	if (typeof location === 'undefined') {
		return 'https://awtsmoos.com/';
	}
	return location.href;
}
