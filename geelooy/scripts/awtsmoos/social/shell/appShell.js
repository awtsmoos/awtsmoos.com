// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppShell
 * @description
 * One Horizon, Context Ribbon, and emoji dock surround Awtsmoos.com. The
 * Awtsmoos places Ikar at the center while each native route remains sovereign.
 */
import { currentAppRoute, primaryRoutes } from './appRoutes.js';
import { createContextRibbon } from './contextRibbon.js';
import { isCanonicalRouteLink } from './routeCurrentState.js';
import { createUnusualHeader } from './unusualHeader.js';

const CURRENT_ROUTE_OWNER = 'shell';
const ROUTE_LINK_SELECTOR = 'a[data-g-route-link]';

/** Adds the canonical shell without replacing route content. */
export function ensureAppShell(root = document) {
	if (!root.body) {
		return null;
	}
	const existing = root.querySelector('[data-g-shell]');
	if (existing) {
		return existing;
	}
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
		if (link.dataset.gRouteCurrent !== CURRENT_ROUTE_OWNER) {
			return;
		}
		link.removeAttribute('aria-current');
		delete link.dataset.gRouteCurrent;
	});
}

function createDock(root) {
	const dock = root.createElement('nav');
	dock.className = 'g-dock';
	dock.setAttribute('aria-label', 'Primary Geelooy routes');
	for (const route of primaryRoutes) {
		dock.append(createDockLink(root, route));
	}
	return dock;
}

function createDockLink(root, route) {
	const link = root.createElement('a');
	link.href = route.href;
	link.dataset.gRouteLink = 'true';
	if (route.main) {
		link.dataset.mainRoute = 'true';
	}
	const icon = root.createElement('span');
	icon.className = 'g-route-icon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = route.icon;
	const label = root.createElement('small');
	label.className = 'g-route-label';
	label.textContent = route.label;
	link.append(icon, label);
	return link;
}

function currentPageHref() {
	if (typeof location === 'undefined') {
		return 'https://awtsmoos.com/';
	}
	return location.href;
}
