// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteFocusAndScroll
 * @description
 * The Awtsmoos places attention where an Awtsmoos.com journey actually arrives:
 * at a requested anchor, a restored coordinate, or the destination heading.
 */
import { ROUTE_OUTLET_SELECTOR } from './routeRegistry.js';
import { scrollFromHistory } from './historyState.js';

/** Settles focus and scroll after an atomic route replacement. */
export function settleRoutePosition(url, options = {}) {
	const root = options.root || document;
	const view = root.defaultView || window;
	view.requestAnimationFrame(() => {
		if (options.mode === 'pop') {
			const saved = scrollFromHistory(options.state);
			if (saved) view.scrollTo(saved.x, saved.y);
			return;
		}

		const destination = new URL(String(url), view.location.href);
		const hashTarget = targetFromHash(destination.hash, root);
		if (hashTarget) {
			hashTarget.scrollIntoView();
			focusTarget(hashTarget);
			return;
		}

		view.scrollTo(0, 0);
		const outlet = root.querySelector(ROUTE_OUTLET_SELECTOR);
		focusTarget(outlet?.querySelector('h1') || outlet);
	});
}

function targetFromHash(hash, root) {
	if (!hash) return null;
	try {
		return root.getElementById(decodeURIComponent(hash.slice(1)));
	} catch {
		return null;
	}
}

function focusTarget(node) {
	if (!node?.focus) return;
	const alreadyFocusable = node.matches?.('a[href], button, input, select, textarea, [tabindex]');
	if (!alreadyFocusable) {
		node.setAttribute('tabindex', '-1');
		node.addEventListener('blur', () => node.removeAttribute('tabindex'), { once: true });
	}
	node.focus({ preventScroll: true });
}
