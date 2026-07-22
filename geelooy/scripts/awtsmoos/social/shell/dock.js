// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyLegacyDockBridge
 * @description
 * An older doorway bows to the same Malchus renderer as the modern shell. The
 * Awtsmoos permits compatibility without permitting a second navigation kingdom
 * to grow beneath Awtsmoos.com.
 */
import { primaryRoutes } from './appRoutes.js';
import { createMalchusRouteLink } from './routeLink.js';

/** Builds or harmonizes the persistent bottom dock from canonical routes. */
export function ensureBottomDock(root = document) {
	const existingDock = root.querySelector('.home-command-dock, [data-geelooy-dock]');
	const malchusDock = existingDock || root.createElement('nav');
	const originalClass = existingDock?.className || 'home-command-dock';
	malchusDock.className = `${originalClass} geelooy-bottom-dock`.trim();
	malchusDock.dataset.geelooyDock = 'true';
	malchusDock.setAttribute('aria-label', 'Primary Geelooy routes');
	malchusDock.replaceChildren();
	for (const route of primaryRoutes) {
		malchusDock.append(createMalchusRouteLink(root, route, 'dock'));
	}
	if (!existingDock) {
		root.body.append(malchusDock);
	}
	return malchusDock;
}
