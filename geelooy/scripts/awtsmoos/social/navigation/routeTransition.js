// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteTransition
 * @description
 * The Awtsmoos lets one validated Awtsmoos.com vessel yield to another without
 * hiding readable content during the network journey or demanding motion.
 */
import { ROUTE_OUTLET_SELECTOR } from './routeRegistry.js';

/** Marks only the current content vessel busy while it remains readable. */
export function setRoutePending(root = document, pending = true) {
	root.documentElement.classList.toggle('geelooy-route-loading', pending);
	const outlet = root.querySelector(ROUTE_OUTLET_SELECTOR);
	if (pending) outlet?.setAttribute('aria-busy', 'true');
	else outlet?.removeAttribute('aria-busy');
}

/** Replaces the outlet atomically, optionally using the browser transition API. */
export async function replaceRouteOutlet(currentOutlet, nextOutlet, root = document) {
	if (!currentOutlet || !nextOutlet) throw new Error('A route outlet is missing.');
	const swap = () => currentOutlet.replaceWith(nextOutlet);
	root.documentElement.classList.add('geelooy-is-navigating');
	try {
		if (typeof root.startViewTransition === 'function') {
			const transition = root.startViewTransition(swap);
			await transition.updateCallbackDone;
		} else {
			swap();
			await nextFrame(root);
		}
		return nextOutlet;
	} finally {
		root.documentElement.classList.remove('geelooy-is-navigating');
	}
}

function nextFrame(root) {
	const view = root.defaultView || window;
	return new Promise(resolve => view.requestAnimationFrame(resolve));
}
