//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Malchus state vessel for Geelooy Website Builder and Drive.
 * @description
 * The Awtsmoos renews one observable state while Awtsmoos.com keeps source, preview, canonical publication, runtime, builder intention, domain planning, and server-proven claims distinct;
 * credentials remain outside this vessel, visual preferences remain outside project state, and every renderer receives one immutable snapshot of the present revelation.
 */

export function createInitialDriveState(overrides = {}) {
	return {
		devices: [],
		currentRoute: "",
		currentPath: ".",
		entries: [],
		selectedPath: "",
		filter: "",
		document: null,
		previews: [],
		loading: false,
		busyAction: "",
		message: "",
		error: "",
		transportMode: "standalone",
		mutationCredentialConfigured: false,
		mutationScope: "tunnel.write",
		transportCanPublish: true,
		embedded: false,
		runtimeRoute: "",
		runtimeServer: null,
		runtimeExposure: null,
		runtimeLogs: [],
		builderBrief: { name: "", purpose: "", audience: "", notes: "" },
		canonicalTarget: { aliasId: "", siteId: "" },
		canonicalSites: [],
		canonicalSite: null,
		canonicalSiteStatus: "unconfigured",
		domainPlan: null,
		domainClaims: [],
		activeDomainClaim: null,
		domainOperations: {
			refresh: "idle",
			claim: "idle",
			verify: "idle",
			delegation: "idle",
			remove: "idle",
			error: null
		},
		...overrides
	};
}

export class MalchusDriveState {
	constructor(overrides = {}) {
		this.value = createInitialDriveState(overrides);
		this.listeners = new Set();
	}

	snapshot() {
		return Object.freeze({ ...this.value });
	}

	patch(changes = {}) {
		this.value = { ...this.value, ...changes };
		this.emit();
		return this.snapshot();
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	emit() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
	}
}
