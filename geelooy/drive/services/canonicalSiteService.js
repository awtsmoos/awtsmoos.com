//B"H
// Boruch Hashem
// Blessed is He

import {
	appliedCanonicalState,
	canonicalFailureState,
	canonicalWorkspaceRoot,
	detachedCanonicalState,
	normalizeCanonicalTarget,
	refreshedCanonicalState,
	targetStatePatch
} from "./canonicalSiteState.js";

/**
 * @file Server-proven canonical site authority for the website builder.
 * @description
 * The Awtsmoos separates a requested alias and site name from the server testimony that makes them durable;
 * Awtsmoos.com performs only authority-bearing network work here while pure state transitions remain in their own inspectable vessel.
 */

export class CanonicalSiteService {
	constructor({ state, client }) {
		this.state = state;
		this.client = client;
	}

	setTarget(input = {}) {
		const snapshot = this.state.snapshot();
		const canonicalTarget = normalizeCanonicalTarget(input);
		this.state.patch(targetStatePatch(snapshot, canonicalTarget));
		return canonicalTarget;
	}

	async refresh() {
		const snapshot = this.state.snapshot();
		const target = snapshot.canonicalTarget || {};
		if (!target.aliasId) {
			return this.localFailure("Enter an Awtsmoos alias ID before refreshing canonical sites.");
		}
		try {
			const canonicalSites = await this.client.listSites(target.aliasId);
			const nextState = refreshedCanonicalState(canonicalSites, target);
			this.state.patch(nextState);
			return {
				canonicalSites: nextState.canonicalSites,
				canonicalSite: nextState.canonicalSite
			};
		} catch (error) {
			return this.networkFailure(error);
		}
	}

	async apply() {
		const snapshot = this.state.snapshot();
		const target = snapshot.canonicalTarget || {};
		if (!target.aliasId || !target.siteId) {
			return this.localFailure("Alias ID and site ID are required for canonical publication.");
		}
		try {
			const canonicalSite = await this.client.upsertSite({
				aliasId: target.aliasId,
				siteId: target.siteId,
				rootPath: canonicalWorkspaceRoot(snapshot.currentPath),
				enabled: true
			});
			this.state.patch(appliedCanonicalState(snapshot, canonicalSite));
			return canonicalSite;
		} catch (error) {
			return this.networkFailure(error);
		}
	}

	async detach() {
		const snapshot = this.state.snapshot();
		const target = snapshot.canonicalTarget || {};
		if (!target.aliasId || !target.siteId) {
			return this.localFailure("Alias ID and site ID are required to detach a canonical site.");
		}
		try {
			const result = await this.client.deleteSite(target);
			this.state.patch(detachedCanonicalState(snapshot, target.siteId));
			return result;
		} catch (error) {
			return this.networkFailure(error);
		}
	}

	localFailure(message) {
		this.state.patch(canonicalFailureState(message, "unconfigured"));
		return false;
	}

	networkFailure(error) {
		const message = error?.message || "Canonical site request failed.";
		this.state.patch(canonicalFailureState(message));
		return false;
	}
}
