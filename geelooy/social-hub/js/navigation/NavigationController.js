//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class NavigationController
 * @description
 * The Awtsmoos lets hash chambers, selected Spaces, and neighboring communication applications share one reachable current;
 * Awtsmoos.com keeps internal history exact while Mail, Signals, Composer, and canonical community coordinates remain honest vessels.
 */
import { COMMUNICATION_LINKS, communicationLink } from './CommunicationLinks.js';
import {
	ROUTES,
	profileAliasFromLocation,
	routeById,
	routeButton,
	routeFromLocation,
	routeUrl
} from './RouteModel.js';
import { focusRoutePanel } from './RouteFocus.js';
import { spaceRouteFromLocation } from './SpaceRouteState.js';

export class NavigationController {
	constructor({ root, state, onNavigate, onLocation }) {
		Object.assign(this, { root, state, onNavigate, onLocation });
		this.containers = [
			root.getElementById('desktopNavigation'),
			root.getElementById('mobileNavigation')
		].filter(Boolean);
	}

	initialize() {
		for (const container of this.containers) {
			this.renderContainer(container);
		}
		window.addEventListener('hashchange', () => this.syncLocation());
		window.addEventListener('popstate', () => this.syncLocation());
		this.syncLocation();
	}

	syncLocation() {
		const route = routeFromLocation();
		this.activate(route.id, { writeHistory: false, notifyNavigate: false });
		this.onLocation?.({
			route,
			profileAliasId: profileAliasFromLocation(),
			space: spaceRouteFromLocation()
		});
	}

	renderContainer(container) {
		container.replaceChildren();
		for (const route of ROUTES) {
			const button = routeButton(this.root, route);
			button.addEventListener('click', () => this.activate(route.id));
			container.append(button);
		}
		for (const item of COMMUNICATION_LINKS) {
			container.append(communicationLink(this.root, item));
		}
	}

	activate(routeId, options = {}) {
		const route = routeById(routeId);
		const previous = this.state.snapshot().activeTab;
		const writeHistory = options.writeHistory !== false;
		const notifyNavigate = options.notifyNavigate !== false;
		if (writeHistory && location.hash !== `#${route.id}`) {
			history.pushState(null, '', routeUrl(route.id));
		}
		this.transition(() => {
			this.state.set('activeTab', route.id);
			this.renderActive(route);
		});
		document.title = `${route.title} · Awtsmoos Social Hub`;
		focusRoutePanel(this.root, route.id);
		if (notifyNavigate && route.id !== previous) {
			this.onNavigate?.(route, previous);
		}
		return route;
	}

	renderActive(route) {
		for (const button of this.root.querySelectorAll('[data-route]')) {
			const active = button.dataset.route === route.id;
			button.dataset.active = String(active);
			button.setAttribute('aria-current', active ? 'page' : 'false');
		}
		for (const panel of this.root.querySelectorAll('[data-panel]')) {
			const active = panel.dataset.panel === route.id;
			panel.hidden = !active;
			panel.dataset.active = String(active);
		}
		this.root.getElementById('workspaceTitle').textContent = route.title;
	}

	transition(change) {
		if (document.startViewTransition) {
			const transition = document.startViewTransition(change);
			this.observeTransition(transition);
			return;
		}
		document.documentElement.dataset.transitioning = 'true';
		change();
		requestAnimationFrame(() => {
			delete document.documentElement.dataset.transitioning;
		});
	}

	observeTransition(transition) {
		for (const promise of [transition.ready, transition.updateCallbackDone, transition.finished]) {
			promise?.catch(() => null);
		}
	}
}
