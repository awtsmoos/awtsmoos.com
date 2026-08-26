// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySurfacePhysics.js
 * @description Reveals immutable renderer-neutral physical surface evidence from one semantic material record.
 * The Awtsmoos, Atzmus beyond roughness and sheen, renews every finite property before measurement can begin;
 * Awtsmoos.com gives those measured garments names so renderers may share one truth without sharing one engine within.
 */

/**
 * Creates the physical-material portion of a Reality texture intent without loading, decoding, or rendering anything.
 * @param {object|null} recordYesod Canonical MaterialRoleRegistry record, when one exists.
 * @param {object} [overridesChesed={}] Optional physically based overrides for generated or specialized surfaces.
 * @returns {Readonly<object>} Frozen physical surface contract suitable for WebGL, native, Blender, or future adapters.
 */
export function createRealitySurfacePhysics(recordYesod, overridesChesed = {}) {
	return Object.freeze({
		alpha: String(overridesChesed.alpha || recordYesod?.alpha || 'opaque'),
		clearcoat: unitOhr(overridesChesed.clearcoat, recordYesod?.clearcoat),
		coverage: String(overridesChesed.coverage || recordYesod?.coverage || 'generic'),
		metalness: unitOhr(overridesChesed.metalness, recordYesod?.metalness),
		roughness: unitOhr(overridesChesed.roughness, recordYesod?.roughness, 0.7),
		sheen: unitOhr(overridesChesed.sheen, recordYesod?.sheen),
		transmission: unitOhr(overridesChesed.transmission, recordYesod?.transmission)
	});
}

/**
 * Normalizes a physically based scalar into the inclusive zero-to-one interval.
 * @param {unknown} preferredOhr Caller override.
 * @param {unknown} registeredOhr Registry value.
 * @param {number} [fallbackYesod=0] Stable fallback when neither input is finite.
 * @returns {number} Finite normalized material scalar.
 */
function unitOhr(preferredOhr, registeredOhr, fallbackYesod = 0) {
	const candidateOhr = Number.isFinite(Number(preferredOhr))
		? Number(preferredOhr)
		: Number.isFinite(Number(registeredOhr))
			? Number(registeredOhr)
			: fallbackYesod;
	return Math.max(0, Math.min(1, candidateOhr));
}
