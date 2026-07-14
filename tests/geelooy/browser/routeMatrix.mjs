// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteMatrix
 * @description
 * Names every public chamber that shares the Geelooy visual covenant. The
 * Awtsmoos proves the same fast shell and intentional controls in each route,
 * including the primary Ikar Heichel itself.
 */

export const ROUTES = [
	{ id: 'home', path: '/', shell: true },
	{ id: 'notifications', path: '/notifications', shell: true },
	{ id: 'profile', path: '/profile', shell: true },
	{ id: 'mail', path: '/email', shell: true },
	{ id: 'about', path: '/about', shell: true },
	{ id: 'apps', path: '/apps', shell: true },
	{ id: 'heichelos', path: '/heichelos', shell: true },
	{ id: 'ikar', path: '/heichelos/ikar', shell: true },
	{ id: 'sefarim', path: '/mawgawl/sefarim', shell: true },
	{ id: 'post-editor', path: '/post-editor', shell: true },
	{ id: 'heichel-editor', path: '/heichel-editor', shell: true },
	{ id: 'comment-thread', path: '/comment-thread', shell: true },
	{ id: 'login', path: '/login', shell: false },
	{ id: 'register', path: '/register', shell: false }
];

export const VIEWPORTS = [
	{
		id: 'mobile',
		width: 709,
		height: 1536,
		deviceScaleFactor: 1,
		mobile: true
	},
	{
		id: 'desktop',
		width: 1440,
		height: 1000,
		deviceScaleFactor: 1,
		mobile: false
	}
];

export function routeUrl(baseUrl, route) {
	return new URL(route.path, baseUrl).href;
}
