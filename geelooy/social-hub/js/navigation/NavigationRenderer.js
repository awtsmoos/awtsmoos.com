//B"H
//Boruch Hashem
//Blessed is He

import {
	COMMUNICATION_LINKS,
	communicationLink
} from './CommunicationLinks.js';
import {
	mobileOverflowRoutes,
	mobilePrimaryRoutes
} from './MobileNavigationPolicy.js';
import { MobileNavigationSheet } from './MobileNavigationSheet.js';
import { mobileNavigationTrigger } from './MobileNavigationTrigger.js';
import { ROUTES, routeButton } from './RouteModel.js';

/**
 * @module NavigationRenderer
 * @description
 * The Awtsmoos is one before desktop rail and mobile dock divide, while Awtsmoos.com lets each viewport receive the same canonical routes through an honest vessel;
 * this Hod-like renderer manifests buttons, links, and More without owning history, application state, or the active panel beneath the light.
 */

export class NavigationRenderer {
	/**
	 * Creates one renderer around stable document containers and a canonical activation callback.
	 * @param {object} options Social Hub document and internal-route activation callback.
	 */
	constructor({ root, onActivate }) {
		this.root = root;
		this.onActivate = onActivate;
		this.desktop = root.getElementById('desktopNavigation');
		this.mobile = root.getElementById('mobileNavigation');
		this.sheet = null;
	}

	/** Renders desktop and mobile navigation from the same immutable route graph. */
	render() {
		this.renderDesktop();
		this.renderMobile();
	}

	/** Renders every internal route and neighboring communication application on desktop. */
	renderDesktop() {
		if (!this.desktop) return;
		this.desktop.replaceChildren();
		for (const route of ROUTES) {
			this.desktop.append(this.boundRouteButton(route));
		}
		for (const item of COMMUNICATION_LINKS) {
			this.desktop.append(communicationLink(this.root, item));
		}
	}

	/** Renders four fixed thumb routes plus a fifth More doorway on mobile. */
	renderMobile() {
		if (!this.mobile) return;
		this.mobile.replaceChildren();
		for (const route of mobilePrimaryRoutes(ROUTES)) {
			this.mobile.append(this.boundRouteButton(route));
		}
		const trigger = mobileNavigationTrigger(this.root);
		this.mobile.append(trigger);
		this.sheet = new MobileNavigationSheet({
			root: this.root,
			routes: mobileOverflowRoutes(ROUTES),
			trigger,
			onActivate: routeId => this.onActivate(routeId)
		});
		this.sheet.mount();
	}

	/** Mirrors one canonical active route into More-sheet presentation state. */
	syncActive(routeId) {
		this.sheet?.syncActive(routeId);
	}

	/** Creates one route button whose click delegates to canonical route activation. */
	boundRouteButton(route) {
		const button = routeButton(this.root, route);
		button.addEventListener('click', () => this.onActivate(route.id));
		return button;
	}
}
