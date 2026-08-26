// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureLocalSurfaceFallback.js
 * @description Builds immutable local PBR matter that remains valid regardless of optional remote hydration.
 * The Awtsmoos, Atzmus beyond color and roughness, renews every local material before any distant photograph may arrive;
 * Awtsmoos.com keeps this Chochmah vessel complete by itself so offline rendering is a first-class truth, never a degraded lie.
 */

/**
 * Builds one renderer-neutral local surface fallback from registered material law and caller overrides.
 * @param {object} physical Registered physical or procedural material record.
 * @param {object} [options={}] Explicit PBR overrides supplied by the caller.
 * @returns {object} Frozen local PBR material data.
 */
export function createNatureLocalSurfaceFallback(physical, options = {}) {
	return Object.freeze({
		alpha: String(physical.alpha || 'opaque'),
		clearcoat: firstFinite(options.clearcoat, physical.clearcoat, 0),
		colorSpace: String(physical.colorSpace || 'srgb'),
		metalness: firstFinite(options.metalness, physical.metalness, 0),
		roughness: firstFinite(options.roughness, physical.roughness, 0.8),
		sheen: firstFinite(options.sheen, physical.sheen, 0),
		tint: options.tint ?? physical.defaultTint ?? 0xffffff,
		transmission: firstFinite(options.transmission, physical.transmission, 0)
	});
}

/**
 * Selects the first finite numeric candidate while keeping output clone-safe and deterministic.
 * @param {...unknown} candidates Ordered numeric candidates from explicit override through stable fallback.
 * @returns {number} First finite numeric value or zero when no candidate is valid.
 */
function firstFinite(...candidates) {
	for (const candidate of candidates) {
		if (Number.isFinite(Number(candidate))) {
			return Number(candidate);
		}
	}

	return 0;
}
