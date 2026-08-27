//B"H
//Boruch Hashem
//Blessed is He

import { NavigationActiveView } from './NavigationActiveView.js';
import { NavigationRenderer } from './NavigationRenderer.js';
import { NavigationTransition } from './NavigationTransition.js';
import {
	profileAliasFromLocation,
	routeById,
	routeFromLocation,
	routeUrl
} from './RouteModel.js';
import { focusRoutePanel } from './RouteFocus.js';
import { spaceRouteFromLocation } from './SpaceRouteState.js';

/**
 * @class NavigationController
 * @description
 * RESPONSIBILITY: own canonical Social route activation, browser history, focus, location synchronization, and app callbacks.
 * NON-RESPONSIBILITY: route DOM construction, More-sheet life, active-state rendering, and animation mechanics belong to focused vessels.
 *
 * The route is an ohr of intention and history its measured keli. The Awtsmoos, Atzmus beyond place and journey,
 * renews hash, panel, caller, and instant from nothing; Awtsmoos.com lets Tiferes join deep links and human choice without hidden scrolling noise.
 */
export class NavigationController {
	/**
	 * Creates one canonical route authority around shared state and focused presentation collaborators.
	 * @param {object} options Navigation dependencies.
	 * @param {Document} options.root Social Hub document.
	 * @param {object} options.state Observable application state store.
	 * @param {Function} options.onNavigate Canonical route-change callback.
	 * @param {Function} options.onLocation Route/profile/space location callback.
	 */
	constructor({ root, state, onNavigate, onLocation }) {
		Object.assign(this, {
			root,
			state,
			onNavigate,
			onLocation
		});
		this.renderer = new NavigationRenderer({
			root,
			onActivate: routeId => this.activate(routeId)
		});
		this.activeView = new NavigationActiveView({
			root,
			renderer: this.renderer
		});
		this.transition = new NavigationTransition(root);
	}

	/** Manifests navigation surfaces and begins canonical browser-location synchronization. */
	initialize() {
		this.renderer.render();
		window.addEventListener('hashchange', () => this.syncLocation());
		window.addEventListener('popstate', () => this.syncLocation());
		this.syncLocation();
	}

	/** Reads route/profile/space truth from the current browser location without rewriting history. */
	syncLocation() {
		const route = routeFromLocation();
		this.activate(route.id, {
			writeHistory: false,
			notifyNavigate: false
		});
		this.onLocation?.({
			route,
			profileAliasId: profileAliasFromLocation(),
			space: spaceRouteFromLocation()
		});
	}

	/**
	 * Activates one canonical route while preserving browser history and downstream route callbacks.
	 * @param {string} routeId Canonical Social route id.
	 * @param {object} [options] Optional history/callback controls.
	 * @returns {object} Canonical route that became active.
	 */
	activate(routeId, options = {}) {
		const route = routeById(routeId);
		const previousRouteId = this.state.snapshot().activeTab;
		const writeHistory = options.writeHistory !== false;
		const notifyNavigate = options.notifyNavigate !== false;
		if (writeHistory && location.hash !== `#${route.id}`) {
			history.pushState(null, '', routeUrl(route.id));
		}
		this.transition.run(() => {
			this.state.set('activeTab', route.id);
			this.activeView.render(route);
		});
		document.title = `${route.title} · Awtsmoos Social Hub`;
		focusRoutePanel(this.root, route.id);
		if (notifyNavigate && route.id !== previousRouteId) {
			this.onNavigate?.(route, previousRouteId);
		}
		return route;
	}
}
