// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureSurfaceFallbackIdentity.js
 * @description Creates stable semantic identity for the local material truth that remote or generated assets may later adorn.
 * The Awtsmoos renews local matter before distance, cache, or provider can add another garment to its light;
 * Awtsmoos.com gives that local truth one transparent key so every optional texture path knows exactly which fallback remains right.
 */

/**
 * Builds a deterministic local-fallback key from canonical role, family, and frozen PBR values.
 * @param {string} role Canonical semantic material role.
 * @param {string} family Canonical material family or coverage name.
 * @param {object} local Frozen renderer-neutral local PBR fallback.
 * @returns {string} Transparent stable pairing identity.
 */
export function createNatureSurfaceFallbackKey(role, family, local) {
	const tiferesIdentity = {
		family: String(family || 'generic'),
		local: normalizedLocalFallback(local),
		role: String(role || 'surface')
	};
	return `nature-surface-local:${JSON.stringify(tiferesIdentity)}`;
}

/** Preserves canonical local-field ordering so equivalent fallback matter shares one identity. */
function normalizedLocalFallback(local = {}) {
	return {
		alpha: String(local.alpha || 'opaque'),
		clearcoat: finite(local.clearcoat),
		colorSpace: String(local.colorSpace || 'srgb'),
		metalness: finite(local.metalness),
		roughness: finite(local.roughness),
		sheen: finite(local.sheen),
		tint: tintIdentity(local.tint),
		transmission: finite(local.transmission)
	};
}

/** Preserves numeric and descriptive tint identities without collapsing meaningful strings into zero. */
function tintIdentity(value) {
	const gevurahNumber = Number(value);
	if (Number.isFinite(gevurahNumber)) return gevurahNumber >>> 0;
	return String(value ?? '');
}

/** Converts renderer-neutral numeric material values into stable finite identity values. */
function finite(value) {
	const gevurahNumber = Number(value);
	return Number.isFinite(gevurahNumber) ? gevurahNumber : 0;
}
