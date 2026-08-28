// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalStateRenderer
 * @description
 * The Awtsmoos renews busy, error, empty, detail, and inspector states without confusing them with navigation or transport;
 * Awtsmoos.com gives each state one accessible manifestation so the page controller remains a small coordinator rather than a many-headed port.
 */

import {
	portalStatus,
	replacePortalChildren
} from "/scripts/awtsmoos/portal/PortalDom.js";

/**
 * @description Renders one Portal state snapshot into the semantic content/status hosts.
 * @param {Object} options - Rendering dependencies.
 * @param {Document} options.documentRoot - Portal document containing view controls.
 * @param {HTMLElement} options.content - Main resource-content host.
 * @param {HTMLElement} options.status - Live status host.
 * @param {Object} options.registry - Trusted PortalRendererRegistry instance.
 * @param {(resource:Object)=>void} options.openResource - Resource-navigation callback for cards.
 * @param {Object} state - PortalState snapshot.
 * @returns {void}
 */
export function renderPortalState(options, state) {
	const statusMessage = state.busy
		? "Loading Portal resource…"
		: state.error
			? state.error.message || "Portal request failed."
			: "";

	options.status.textContent = statusMessage;
	options.status.setAttribute("role", state.error ? "alert" : "status");

	if (state.busy) {
		replacePortalChildren(options.content, [portalStatus("Loading Portal resource…")]);
		return;
	}

	if (state.error) {
		replacePortalChildren(options.content, [portalStatus(statusMessage, "alert")]);
		return;
	}

	if (!state.resource) {
		replacePortalChildren(options.content, [portalStatus("No Portal resource is selected.")]);
		return;
	}

	const node = options.registry.render(state.resource, state.view, {
		openResource: options.openResource
	});
	replacePortalChildren(options.content, [node]);

	for (const control of options.documentRoot.querySelectorAll("[data-portal-view]")) {
		control.setAttribute(
			"aria-pressed",
			String(control.dataset.portalView === state.view)
		);
	}
}
