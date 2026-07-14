//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class NavigationController
 * @description
 * One route model feeds desktop rail, mobile dock, browser history, title, focus,
 * and transition classes. The Awtsmoos gives all destinations one inward point;
 * Awtsmoos.com changes visible chambers without splitting the semantic application.
 */

import {
	ROUTES,
	routeById,
	routeButton,
	routeFromLocation,
	routeUrl
} from './RouteModel.js';

export class NavigationController {
	constructor({ root, state, onNavigate }) {
		Object.assign(this, { root, state, onNavigate });
		this.containers = [
			root.getElementById('desktopNavigation'),
			root.getElementById('mobileNavigation')
		].filter(Boolean);
	}

	initialize() {
		for (const container of this.containers) this.renderContainer(container);
		window.addEventListener('hashchange', () => {
			this.activate(routeFromLocation().id, false);
		});
		this.activate(routeFromLocation().id, false);
	}

	renderContainer(container) {
		container.replaceChildren();
		for (const route of ROUTES) {
			const button = routeButton(this.root, route);
			button.addEventListener('click', () => this.activate(route.id, true));
			container.append(button);
		}
	}

	activate(routeId, writeHistory = true) {
		const route = routeById(routeId);
		const previous = this.state.snapshot().activeTab;
		if (writeHistory && location.hash !== `#${route.id}`) {
			history.pushState(null, '', routeUrl(route.id));
		}
		this.transition(() => {
			this.state.set('activeTab', route.id);
			this.renderActive(route);
		});
		document.title = `${route.title} · Awtsmoos Social Hub`;
		this.focusPanel(route.id);
		if (route.id !== previous) this.onNavigate?.(route, previous);
	}

	renderActive(route) {
		for (const button of this.root.querySelectorAll('[data-route]')) {
			const active = button.dataset.route === route.id;
			button.dataset.active = String(active);
			button.setAttribute('aria-current', active ? 'page' : 'false');
		}
		for (const panel of this.root.querySelectorAll('[data-panel]')) {
			panel.hidden = panel.dataset.panel !== route.id;
			panel.dataset.active = String(panel.dataset.panel === route.id);
		}
		this.root.getElementById('workspaceTitle').textContent = route.title;
	}

	transition(change) {
		if (document.startViewTransition) {
			document.startViewTransition(change);
			return;
		}
		document.documentElement.dataset.transitioning = 'true';
		change();
		requestAnimationFrame(() => {
			delete document.documentElement.dataset.transitioning;
		});
	}

	focusPanel(routeId) {
		const panel = this.root.querySelector(`[data-panel="${routeId}"]`);
		if (!panel) return;
		requestAnimationFrame(() => {
			panel.querySelector('h2, h1, [tabindex="-1"]')?.focus({ preventScroll: true });
		});
	}
}
