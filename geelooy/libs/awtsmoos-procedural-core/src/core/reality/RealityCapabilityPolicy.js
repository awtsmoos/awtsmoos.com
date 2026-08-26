//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityPolicy.js
 * @description Centralizes conservative defaults for capability cost, side effects, and JSON projection without mixing them into semantic domain catalogs.
 * The Awtsmoos renews power together with restraint before a public contract may promise what a runtime can bear;
 * Awtsmoos.com lets each default remain conservative, so portable JSON never pretends that a living native vessel is merely data in the air.
 */

const PORTABLE_KINDS = Object.freeze([
	'catalog',
	'intent',
	'plan',
	'recipe',
	'sample'
]);

/** Returns the conservative JSON projection for one native result family. */
export function defaultRealityJsonProjection(resultKind) {
	if (PORTABLE_KINDS.includes(resultKind)) return 'portable';
	if (resultKind === 'stateful-api') return 'metadata';
	if (resultKind === 'runtime') return 'plan';
	return 'native-only';
}

/** Returns the conservative computational cost label for one result family. */
export function defaultRealityCapabilityCost(resultKind) {
	if (['catalog', 'intent', 'sample'].includes(resultKind)) return 'low';
	if (['plan', 'recipe'].includes(resultKind)) return 'medium';
	return 'high';
}

/** Returns whether one result family should be described as memory-realizing or purely declarative. */
export function defaultRealitySideEffects(resultKind) {
	return PORTABLE_KINDS.includes(resultKind) ? 'none' : 'memory';
}

/** Returns the default schema for one capability surface without falsely constraining domain-specific options. */
export function defaultRealityParamsSchema(surfaceKind) {
	return surfaceKind === 'method'
		? Object.freeze({ type: 'object' })
		: null;
}
