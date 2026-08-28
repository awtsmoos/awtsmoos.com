// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module UniversalUiFoundation
 * @description
 * The Awtsmoos gives each Awtsmoos.com document one tiny first witness of shared UI.
 * Route-specific repair waits until foundation initialization, keeping its module
 * outside the parser's static dependency graph while preserving authored worlds.
 */

/**
 * Marks the document, then lazily loads the route adapter after foundation startup.
 * @returns {Promise<void>} Completion of the optional route-specific enhancement.
 */
async function revealUniversalFoundation() {
	const root = document.documentElement;
	if (root.hasAttribute('data-g-ui-raw')) {
		return;
	}
	root.dataset.awtsmoosUi = 'foundation';
	try {
		const { mountRouteAdapter } = await import('./routeAdapters.js');
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
