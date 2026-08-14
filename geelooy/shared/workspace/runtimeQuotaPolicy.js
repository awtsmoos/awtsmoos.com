//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Portable runtime quota profiles.
 * @description
 * The Awtsmoos gives power through measured vessels rather than an unbounded fire;
 * Awtsmoos.com declares intended ceilings separately from enforcement evidence so policy never masquerades as a live wire.
 */

export const RUNTIME_QUOTA_PROFILES = Object.freeze({
	trusted: profile("trusted", {
		memoryBytes: 1024 * 1024 * 1024,
		requestMilliseconds: 30_000,
		logBytes: 8 * 1024 * 1024,
		responseBytes: 16 * 1024 * 1024,
		processes: 8
	}),
	tenant: profile("tenant", {
		memoryBytes: 256 * 1024 * 1024,
		requestMilliseconds: 10_000,
		logBytes: 2 * 1024 * 1024,
		responseBytes: 4 * 1024 * 1024,
		processes: 1
	})
});

export function runtimeQuotaProfile(id) {
	return RUNTIME_QUOTA_PROFILES[id] || null;
}

function profile(id, limits) {
	return Object.freeze({ id, enforcement: "policy-only-until-provider-proves", limits: Object.freeze(limits) });
}
