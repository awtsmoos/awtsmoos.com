// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalApp
 * @description
 * The Awtsmoos renews route, resource, and renderer in one instant while each concern keeps its own finite vessel;
 * Awtsmoos.com now coordinates lifecycle and loading only, leaving interactions and rendering to focused modules beneath the same calm castle.
 */

import { PortalApiClient } from "/scripts/awtsmoos/portal/PortalApiClient.js";
import { createPortalRendererRegistry } from "/scripts/awtsmoos/portal/PortalBuiltInRenderers.js";
import { bindPortalInteractions } from "./PortalInteractionController.js";
import {
	listenPortalNavigation,
	parsePortalRoute,
	publishPortalRoute
} from "./PortalNavigation.js";
import { loadPortalRoute } from "./PortalRouteLoader.js";
import { PortalState } from "./PortalState.js";
import { renderPortalState } from "./PortalStateRenderer.js";

/**
 * @description Coordinates Portal lifecycle, navigation publication, and read-only route loading without owning control binding or DOM rendering details.
 */
export class PortalApp {
	/**
	 * @description Creates a Portal application bound to the semantic page hosts.
	 * @param {Document} [documentRoot=document] - Document containing Portal hosts and controls.
	 */
	constructor(documentRoot = document) {
		this.document = documentRoot;
		this.client = new PortalApiClient();
		this.registry = createPortalRendererRegistry();
		this.state = new PortalState();
		this.content = documentRoot.getElementById("portal-content");
		this.status = documentRoot.getElementById("portal-status");
		this.cleanup = [];
		this.activeRequestKey = "";
	}

	/**
	 * @description Starts rendering, navigation listeners, interactions, and the initial URL-addressed route.
	 * @returns {Promise<void>} Promise resolved after the initial route load settles.
	 */
	async start() {
		if (!this.content || !this.status) {
			throw new Error("Portal page is missing required content or status hosts.");
		}

		this.stop();
		this.cleanup.push(this.state.subscribe((state) => renderPortalState({
			documentRoot: this.document,
			content: this.content,
			status: this.status,
			registry: this.registry,
			openResource: (resource) => this.navigate({ section: "family", id: resource.id, view: "detail" })
		}, state)));
		this.cleanup.push(listenPortalNavigation((route) => this.load(route)));
		this.cleanup.push(bindPortalInteractions(this.document, {
			navigate: (route) => this.navigate(route),
			currentResource: () => this.state.value.resource,
			currentRoute: () => this.state.value.route
		}));
		await this.load(parsePortalRoute(location.href));
	}

	/**
	 * @description Removes every listener installed by start so remounts and tests never accumulate duplicate behavior.
	 * @returns {void}
	 */
	stop() {
		for (const cleanup of this.cleanup.splice(0)) {
			cleanup();
		}
	}

	/**
	 * @description Publishes and loads one user-requested Portal route.
	 * @param {{section:string,id?:string,view?:string}} route - Destination route.
	 * @returns {Promise<void>} Promise resolved after route loading completes.
	 */
	async navigate(route) {
		publishPortalRoute(route);
		await this.load(route);
	}

	/**
	 * @description Loads one route with explicit busy/error state and stale-response protection.
	 * @param {{section:string,id?:string,view?:string}} route - Route to load.
	 * @returns {Promise<void>} Promise resolved after the latest route attempt settles.
	 */
	async load(route) {
		const normalizedRoute = {
			section: route.section || "families",
			id: route.id || ""
		};
		const view = route.view === "inspector" ? "inspector" : "detail";
		const requestKey = `${normalizedRoute.section}:${normalizedRoute.id}:${performance.now()}`;
		this.activeRequestKey = requestKey;
		this.state.set({ route: normalizedRoute, view, busy: true, error: null });

		try {
			const resource = await loadPortalRoute(this.client, normalizedRoute);
			if (this.activeRequestKey === requestKey) {
				this.state.set({ resource, busy: false, error: null });
			}
		} catch (error) {
			if (this.activeRequestKey === requestKey) {
				this.state.set({ resource: null, busy: false, error });
			}
		}
	}
}
