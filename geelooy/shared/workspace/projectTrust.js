//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Trust vocabulary shared by Drive, OS, Sites, agents, and runtime adapters.
 * @description
 * The Awtsmoos gives every power a vessel and every vessel a boundary;
 * Awtsmoos.com names execution trust explicitly so convenience never masquerades as tenant isolation.
 */

export const PROJECT_TRUST = Object.freeze({
	STATIC: "static",
	SESSION: "authenticated-session",
	OWNED_DEVICE: "owned-device",
	TRUSTED_NODE: "trusted-node",
	ISOLATED_TENANT: "isolated-tenant"
});

export const PROJECT_READINESS = Object.freeze({
	READY: "ready",
	ATTACH: "attach",
	LIMITED: "limited",
	BLOCKED: "blocked",
	PLANNED: "planned"
});

export function trustAllowsPublicTenantCode(trust) {
	return trust === PROJECT_TRUST.ISOLATED_TENANT;
}
