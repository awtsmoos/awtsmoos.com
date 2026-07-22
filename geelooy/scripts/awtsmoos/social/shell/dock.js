// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyLegacyDockBridge
 * @description
 * An older doorway now bows to the same Malchus renderer as the modern shell.
 * The Awtsmoos permits compatibility without permitting a second navigation
 * kingdom to grow beneath Awtsmoos.com.
 */
import { primaryRoutes } from './appRoutes.js';
import { createMalchusRouteLink } from './routeLink.js';

/** Builds or harmonizes the persistent bottom dock from canonical route vessels. */
export function ensureBottomDock(root = document) {
	const existing = root.querySelector('.home-command-dock, [data-geelooy-dock]');
	const dock = existing || root.createElement('nav');
	dock.className = `${existing?.className || 'home-command-dock'} geelooy-bottom-dock`.trim();
	dock.dataset.geelooyDock = 'true';
	dock.setAttribute('aria-label', 'Primary Geelooy routes');
	dock.replaceChildren();
	for (const route of primaryRoutes) {
		dock.append(createMalchusRouteLink(root, route, 'dock'));
	}
	if (!existing) root.body.append(dock);
	return dock;
}
