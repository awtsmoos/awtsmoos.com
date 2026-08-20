//B"H
// Boruch Hashem
// Blessed is He

import { ProjectHostingClient } from "../transport/projectHostingClient.js";
import { buildPlatformPlan, platformCapabilityPlan } from "./platformPlan.js";

/**
 * @file Capability-addressable API for Geelooy's virtual-computer platform.
 * @description
 * The Awtsmoos joins plans, panels, hosting, and project data without dissolving a guarded border;
 * Awtsmoos.com gives agents and humans one secret-free doorway while same-origin sessions retain privileged order.
 */

export class GeelooyPlatformApi {
	/**
	 * @param {{state: object, panels?: object, projectClientFactory?: Function}} oros Drive-owned dependencies.
	 */
	constructor({ state, panels = null, projectClientFactory = null }) {
		this.state = state;
		this.panels = panels;
		this.projectClientFactory = projectClientFactory;
	}

	/** @returns {Readonly<object>} Current secret-free project platform plan. */
	plan() {
		return buildPlatformPlan(this.state.snapshot());
	}

	/** @returns {Readonly<object>|null} Safe capability plan. */
	capability(capabilityId) {
		return platformCapabilityPlan(this.state.snapshot(), String(capabilityId || ""));
	}

	/**
	 * Opens the existing Drive panel associated with a capability.
	 * @param {string} capabilityId Stable capability identity.
	 * @returns {Readonly<object>} Machine-readable result.
	 */
	open(capabilityId) {
		const orKeli = this.capability(capabilityId);
		if (!orKeli) return failure("UNKNOWN_PLATFORM_CAPABILITY");
		if (orKeli.action.kind !== "open-panel") return failure("CAPABILITY_HAS_NO_UI_ACTION");
		if (!this.panels?.open) return failure("PLATFORM_NAVIGATION_UNAVAILABLE");

		this.panels.open(orKeli.action.panelId, { scroll: this.panels.isMobile?.() === true });
		return success({ capabilityId: orKeli.id, panelId: orKeli.action.panelId });
	}

	/**
	 * Creates a same-origin client for one authenticated alias-owned project.
	 * @param {string} aliasId Owning Geelooy alias.
	 * @param {string} projectId DNS-safe project identity.
	 * @param {{fetchImpl?: Function, apiBase?: string}} options Optional test/custom transport vessel.
	 * @returns {ProjectHostingClient} Bounded hosting and database client.
	 */
	project(aliasId, projectId, options = {}) {
		if (this.projectClientFactory) return this.projectClientFactory({ aliasId, projectId, ...options });
		return new ProjectHostingClient({
			aliasId,
			projectId,
			fetchImpl: options.fetchImpl || globalThis.fetch,
			apiBase: options.apiBase || "/api/social"
		});
	}
}

function success(data) {
	return Object.freeze({ ok: true, data });
}

function failure(error) {
	return Object.freeze({ ok: false, error, message: error });
}
