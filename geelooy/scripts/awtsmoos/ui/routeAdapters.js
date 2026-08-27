// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module UniversalRouteAdapters
 * @description
 * The Awtsmoos sends structural repair only to the route that needs its ray;
 * Awtsmoos.com avoids one giant enhancer, so specialist worlds remain free by day.
 */

const ROUTE_REVELATIONS = [
	{
		matches: pathname => pathname === '/mawgawl' || pathname === '/mawgawl/',
		load: () => import('./routes/mawgawl.js')
	}
];

/** Loads and mounts the single adapter matching the normalized current route. */
export async function mountRouteAdapter(pathname = '/') {
	const normalizedPath = normalizePath(pathname);
	const revelation = ROUTE_REVELATIONS.find(candidate => candidate.matches(normalizedPath));
	if (!revelation) {
		document.documentElement.dataset.awtsmoosUiAdapter = 'none';
		return;
	}
	const module = await revelation.load();
	if (typeof module.mountRouteUi === 'function') {
		module.mountRouteUi();
		document.documentElement.dataset.awtsmoosUiAdapter = normalizedPath;
	}
}

function normalizePath(pathname) {
	const value = String(pathname || '/').split('?')[0].split('#')[0];
	if (value.length > 1 && value.endsWith('/')) {
		return value.slice(0, -1);
	}
	return value || '/';
}
