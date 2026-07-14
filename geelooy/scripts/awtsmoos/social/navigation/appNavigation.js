// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppNavigation
 * @description Real server pages remain sovereign while the Awtsmoos lets two
 * proven Awtsmoos.com chambers exchange one declared outlet with real fallback.
 */
import { markCurrentLinks } from '../shell/appShell.js';
import { settleRoutePosition } from './focusAndScroll.js';
import { initializeHistory, pushRouteHistory, saveCurrentHistoryScroll } from './historyState.js';
import { anchorFromTarget, shouldHandleRoute, shouldPrefetchRoute } from './linkPolicy.js';
import { cacheRoute, getCachedRoute, routeCacheKey, routeCacheSize } from './routeCache.js';
import { fetchRouteRecord } from './routeFetcher.js';
import { enterRoute, leaveRoute, prepareRoute } from './routeLifecycle.js';
import { materializeRouteOutlet } from './routeParser.js';
import { ROUTE_OUTLET_SELECTOR, routeFor } from './routeRegistry.js';
import { replaceRouteOutlet, setRoutePending } from './routeTransition.js';

const controllers = new WeakMap();

/** Coordinates one document without converting the server application into a router. */
export class HybridNavigationController {
	constructor(root) {
		this.root = root;
		this.view = root.defaultView || window;
		this.activeRequest = null;
		this.warming = new Map();
		this.onIntent = this.onIntent.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onPopState = this.onPopState.bind(this);
	}
	start() {
		if (!routeFor(this.view.location.href) || !this.root.querySelector(ROUTE_OUTLET_SELECTOR)) return false;
		initializeHistory(this.view);
		enterRoute(this.view.location.href, this.root);
		this.root.addEventListener('pointerover', this.onIntent, { passive: true });
		this.root.addEventListener('focusin', this.onIntent);
		this.root.addEventListener('click', this.onClick);
		this.view.addEventListener('popstate', this.onPopState);
		return true;
	}
	onIntent(event) {
		const link = anchorFromTarget(event.target);
		if (shouldPrefetchRoute(link, this.view.location.href, this.view.navigator)) this.warm(link.href);
	}
	onClick(event) {
		const link = anchorFromTarget(event.target);
		if (!shouldHandleRoute(link, event, this.view.location.href)) return;
		event.preventDefault();
		this.navigate(new URL(link.href, this.view.location.href), 'push');
	}
	onPopState(event) {
		const url = new URL(this.view.location.href);
		if (!routeFor(url)) return this.view.location.reload();
		this.navigate(url, 'pop', event.state);
	}
	async warm(input) {
		const url = new URL(String(input), this.view.location.href);
		const key = routeCacheKey(url);
		if (getCachedRoute(url) || this.warming.has(key)) return;
		const promise = fetchRouteRecord(url)
			.then(record => cacheRoute(url, record))
			.catch(() => null);
		this.warming.set(key, promise);
		await promise;
		this.warming.delete(key);
	}
	async navigate(url, mode, state = null) {
		this.activeRequest?.abort();
		const request = new AbortController();
		this.activeRequest = request;
		if (mode === 'push') saveCurrentHistoryScroll(this.view);
		setRoutePending(this.root, true);
		try {
			let record = getCachedRoute(url);
			if (!record) record = cacheRoute(url, await fetchRouteRecord(url, { signal: request.signal }));
			if (request.signal.aborted) return false;
			const current = this.root.querySelector(ROUTE_OUTLET_SELECTOR);
			const next = materializeRouteOutlet(record, this.root);
			if (!current || !next) throw new Error('The live route outlet is unavailable.');
			await prepareRoute(url, this.root);
			leaveRoute();
			await replaceRouteOutlet(current, next, this.root);
			this.root.title = record.title;
			this.root.body.dataset.geelooyRoute = record.routeId;
			if (mode === 'push') pushRouteHistory(url.href, this.view);
			enterRoute(url, this.root);
			markCurrentLinks(this.root);
			settleRoutePosition(url, { root: this.root, mode, state });
			return true;
		} catch (error) {
			if (error?.name === 'AbortError') return false;
			this.nativeFallback(url, mode);
			return false;
		} finally {
			if (this.activeRequest === request) {
				this.activeRequest = null;
				setRoutePending(this.root, false);
			}
		}
	}
	nativeFallback(url, mode) {
		if (mode === 'pop') this.view.location.reload();
		else this.view.location.assign(url.href);
	}
}

/** Starts enhancement only inside an already proven hybrid document. */
export function startAppNavigation(root = document) {
	if (controllers.has(root)) return controllers.get(root);
	const controller = new HybridNavigationController(root);
	if (!controller.start()) return null;
	controllers.set(root, controller);
	return controller;
}

export { routeCacheSize };
