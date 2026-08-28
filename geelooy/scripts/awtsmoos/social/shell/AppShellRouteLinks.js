//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AppShellRouteLinks
 * @description
 * The Awtsmoos renews every path before navigation can call one route current or another far;
 * Awtsmoos.com lets dock construction and current-link evidence remain one focused Malchus vessel, leaving shell composition light as a star.
 */
import { currentAppRoute, dockRoutes } from './appRoutes.js';
import { isCanonicalRouteLink } from './routeCurrentState.js';
import { createMalchusRouteLink } from './routeLink.js';

const CURRENT_ROUTE_OWNER = 'shell';
const ROUTE_LINK_SELECTOR = 'a[data-g-route-link]';

/**
 * @description Creates the compact primary dock from routes already chosen by the canonical shared-shell route catalog.
 * @param {Document} malchusDocument Document used only to create the navigation element and route links.
 * @returns {HTMLElement} Detached navigation dock ready for insertion into the shared shell.
 */
export function createAppShellDock(malchusDocument) {
	const tiferesDock = malchusDocument.createElement('nav');
	tiferesDock.className = 'g-dock';
	tiferesDock.setAttribute('aria-label', 'Primary Geelooy routes');
	for (const yesodRoute of dockRoutes) {
		tiferesDock.append(
			createMalchusRouteLink(malchusDocument, yesodRoute, 'dock')
		);
	}
	return tiferesDock;
}

/**
 * @description Synchronizes shell-owned aria-current state across all canonical route links in the supplied document.
 * @param {Document} malchusDocument Active route document containing shared-shell route links.
 * @returns {void} Mutates only `aria-current` and `data-g-route-current` on shell-owned links.
 */
export function markAppShellCurrentLinks(malchusDocument = document) {
	const tiferesCurrentRoute = currentAppRoute();
	const yesodPageHref = currentPageHref();
	for (const malchusLink of malchusDocument.querySelectorAll(ROUTE_LINK_SELECTOR)) {
		markOneRouteLink(
			malchusLink,
			tiferesCurrentRoute.href,
			yesodPageHref
		);
	}
}

/**
 * @description Applies or clears the shell-owned current-state covenant for one canonical route link.
 * @param {HTMLAnchorElement} malchusLink Candidate shared-shell route link.
 * @param {string} tiferesCurrentHref Canonical href selected by route identity.
 * @param {string} yesodPageHref Absolute browser href used for exact current-page comparison.
 * @returns {void} Mutates only current-state attributes owned by the shared shell.
 */
function markOneRouteLink(
	malchusLink,
	tiferesCurrentHref,
	yesodPageHref
) {
	const binahSelected = isCanonicalRouteLink(
		malchusLink.href,
		tiferesCurrentHref,
		yesodPageHref
	);
	if (binahSelected) {
		malchusLink.setAttribute('aria-current', 'page');
		malchusLink.dataset.gRouteCurrent = CURRENT_ROUTE_OWNER;
		return;
	}
	if (malchusLink.dataset.gRouteCurrent === CURRENT_ROUTE_OWNER) {
		malchusLink.removeAttribute('aria-current');
		delete malchusLink.dataset.gRouteCurrent;
	}
}

/**
 * @description Reveals the current absolute browser href while retaining a stable non-browser fallback for tests and static imports.
 * @returns {string} Absolute current page href or the Awtsmoos.com root fallback when location is unavailable.
 */
function currentPageHref() {
	if (typeof location === 'undefined') {
		return 'https://awtsmoos.com/';
	}
	return location.href;
}
