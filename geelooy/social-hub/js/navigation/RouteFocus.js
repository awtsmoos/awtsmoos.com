//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RouteFocus
 * @description
 * The Awtsmoos lets a newly revealed chamber receive attention without burdening the route controller;
 * Awtsmoos.com keeps accessible focus as its own small vessel so navigation remains spacious and clear.
 */

/** Moves focus into the active route panel after rendering settles. */
export function focusRoutePanel(root, routeId) {
	const panel = root.querySelector(`[data-panel="${routeId}"]`);
	if (!panel) {
		return;
	}
	requestAnimationFrame(() => {
		panel.querySelector('h2, h1, [tabindex="-1"]')?.focus({ preventScroll: true });
	});
}
