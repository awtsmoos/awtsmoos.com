// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyNativePageTransitions
 * @description
 * The Awtsmoos lets sovereign Awtsmoos.com documents feel continuous through
 * respectful prefetch, directional memory, and short native fallback motion.
 */
import { nativeAnchorFromTarget, shouldAnimateNativeLink, shouldPrefetchNativeLink } from './nativeLinkPolicy.js';
import { routeTransitionDirection } from './routeDirection.js';

const STORAGE_KEY = 'awtsmoos-geelooy-route-intent';
const controllers = new WeakMap();
const warmedRoutes = new Set();

/** Binds cross-document continuity once for an eligible shell document. */
export function startNativePageTransitions(root = document) {
	if (controllers.has(root)) return controllers.get(root);
	const view = root.defaultView || window;
	const onIntent = event => warmRoute(nativeAnchorFromTarget(event.target), root, view);
	const onClick = event => navigateWithMotion(event, nativeAnchorFromTarget(event.target), root, view);
	const onPageShow = () => clearLeavingState(root);
	root.addEventListener('pointerover', onIntent, { passive: true });
	root.addEventListener('focusin', onIntent);
	root.addEventListener('click', onClick);
	view.addEventListener('pageshow', onPageShow);
	applyArrivalState(root, view);
	const controller = {
		destroy() {
			root.removeEventListener('pointerover', onIntent);
			root.removeEventListener('focusin', onIntent);
			root.removeEventListener('click', onClick);
			view.removeEventListener('pageshow', onPageShow);
			controllers.delete(root);
		}
	};
	controllers.set(root, controller);
	return controller;
}

function warmRoute(link, root, view) {
	if (!shouldPrefetchNativeLink(link, view.location.href, view.navigator)) return;
	const href = new URL(link.href, view.location.href).href;
	if (warmedRoutes.has(href)) return;
	warmedRoutes.add(href);
	const preload = root.createElement('link');
	preload.rel = 'prefetch';
	preload.href = href;
	preload.as = 'document';
	preload.dataset.geelooyPrefetch = 'true';
	root.head.append(preload);
}

function navigateWithMotion(event, link, root, view) {
	if (!shouldAnimateNativeLink(link, event, view.location.href)) return;
	const destination = new URL(link.href, view.location.href);
	const direction = routeTransitionDirection(view.location.href, destination.href);
	rememberIntent(view, destination, direction);
	if (view.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	event.preventDefault();
	root.documentElement.dataset.routeExitDirection = direction;
	root.documentElement.classList.add('geelooy-native-leaving');
	view.setTimeout(() => view.location.assign(destination.href), 135);
}

function rememberIntent(view, destination, direction) {
	try {
		view.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
			destination: `${destination.pathname}${destination.search}`,
			direction,
			createdAt: Date.now()
		}));
	} catch {
		return;
	}
}

function applyArrivalState(root, view) {
	let intent = null;
	try {
		intent = JSON.parse(view.sessionStorage.getItem(STORAGE_KEY) || 'null');
		view.sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		intent = null;
	}
	const current = `${view.location.pathname}${view.location.search}`;
	if (!intent || intent.destination !== current || Date.now() - intent.createdAt > 8000) return;
	root.documentElement.dataset.routeEnterDirection = intent.direction;
	root.documentElement.classList.add('geelooy-native-arriving');
	view.setTimeout(() => {
		root.documentElement.classList.remove('geelooy-native-arriving');
		delete root.documentElement.dataset.routeEnterDirection;
	}, 520);
}

function clearLeavingState(root) {
	root.documentElement.classList.remove('geelooy-native-leaving');
	delete root.documentElement.dataset.routeExitDirection;
}
