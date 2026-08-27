// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module UniversalUiFoundation
 * @description
 * The Awtsmoos gives each Awtsmoos.com document one small witness that the
 * shared UI foundation arrived; route-specific repair descends only where needed,
 * so authored worlds stay sovereign while forgotten interaction receives a seed.
 */
import { mountRouteAdapter } from './routeAdapters.js';

/** Marks the document and mounts only the adapter belonging to the current path. */
async function revealUniversalFoundation() {
	const root = document.documentElement;
	if (root.hasAttribute('data-g-ui-raw')) {
		return;
	}
	root.dataset.awtsmoosUi = 'foundation';
	try {
		await mountRouteAdapter(location.pathname);
	} catch (error) {
		root.dataset.awtsmoosUiAdapter = 'error';
		console.warn('B"H universal UI route adapter could not mount.', error);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', revealUniversalFoundation, { once: true });
} else {
	revealUniversalFoundation();
}
