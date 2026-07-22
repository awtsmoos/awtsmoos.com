// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyUnifiedShellBoot
 * @description
 * The Awtsmoos reveals one jeweled horizon around every eligible main route.
 * Home, Heichelos, identity, Mail, Apps, and Games receive the same profile
 * crown without duplicate headers or page-scale animation on Awtsmoos.com.
 */
import { bindAppCommand } from './appCommand.js';
import { currentAppRoute } from './appRoutes.js';
import { ensureAppShell } from './appShell.js';
import { ensureToastRegion } from './notifications.js';
import { applyPerformanceProfile } from './performanceProfile.js';
import { isShellEligible } from './routeEligibility.js';
import { bindScrollMemory } from './scrollMemory.js';

const STYLE_HREF = '/style/geelooy-app/index.css?v=interface-dark-012';
const STYLE_SELECTOR = 'link[href*="/style/geelooy-app/index.css"]';
const ROUTE_OUTLET_SELECTOR = '[data-geelooy-route-outlet]';
const SHELL_GENERATION = 'speed-001';

/** Boots shared identity without replacing native route content. */
export function bootGeelooyShell(root = document) {
	if (!root.documentElement || !root.body || !isShellEligible(root.location?.pathname)) return null;
	applyPerformanceProfile(root);
	ensureStylesheet(root);
	applyRouteIdentity(root);
	root.documentElement.classList.add('geelooy-route-ready');
	root.documentElement.dataset.geelooyShellGeneration = SHELL_GENERATION;
	root.body.classList.add('geelooy-app-shell');
	root.body.classList.remove('geelooy-spectral-shell');
	const shell = ensureAppShell(root);
	bindAppCommand(root);
	bindScrollMemory();
	ensureToastRegion();
	startOptionalNavigation(root);
	return shell;
}

/** Loads hybrid navigation only when a route outlet explicitly exists. */
async function startOptionalNavigation(root) {
	if (!root.querySelector(ROUTE_OUTLET_SELECTOR)) return null;
	try {
		const { startAppNavigation } = await import('../navigation/appNavigation.js');
		return startAppNavigation(root);
	} catch (error) {
		console.warn('B"H optional Geelooy navigation stayed native.', error);
		return null;
	}
}

function applyRouteIdentity(root) {
	if (root.body.dataset.geelooyRoute) return;
	const route = currentAppRoute(root.location?.pathname);
	root.body.dataset.geelooyRoute = routeThemeName(route);
}

function routeThemeName(route) {
	if (route.href === '/') return 'home';
	if (route.href === '/mawgawl/sefarim') return 'search';
	if (route.create) return 'create';
	return route.href.split('/').filter(Boolean).at(-1) || 'home';
}

function ensureStylesheet(root) {
	const existing = root.querySelector(STYLE_SELECTOR);
	const expectedHref = new URL(STYLE_HREF, root.baseURI).href;
	if (existing) {
		if (existing.href !== expectedHref) existing.href = STYLE_HREF;
		existing.dataset.geelooyAppStyle = 'true';
		return;
	}
	const link = root.createElement('link');
	link.rel = 'stylesheet';
	link.href = STYLE_HREF;
	link.dataset.geelooyAppStyle = 'true';
	root.head.append(link);
}

if (typeof document !== 'undefined' && isShellEligible(document.location?.pathname)) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => bootGeelooyShell(), { once: true });
	} else {
		bootGeelooyShell();
	}
}
