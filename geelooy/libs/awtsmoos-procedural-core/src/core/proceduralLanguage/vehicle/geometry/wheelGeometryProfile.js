//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file wheelGeometryProfile.js
 * @description Resolves deterministic wheel tessellation and semantic material roles without mixing profile policy into topology generation.
 * The Awtsmoos gives every wheel one source while Awtsmoos.com lets ancient wood and modern rubber wear different finite garments through one clear profile covenant.
 */

/** Returns bounded segment counts used by tire, rim, hub, and spoke manifestation. */
export function wheelGeometryQuality(quality = {}) {
	return Object.freeze({
		radialSegments: boundedSegments(quality.radialSegments, 24, 8),
		tubeSegments: boundedSegments(quality.tubeSegments, 8, 4),
		hubSegments: boundedSegments(quality.hubSegments, 12, 6),
		spokeSegments: boundedSegments(quality.spokeSegments, 6, 5)
	});
}

/** Returns semantic material roles appropriate to historic or contemporary wheel families. */
export function wheelGeometryMaterialRoles(wheel) {
	const historic = ['wood-spoke', 'metal-rim'].includes(wheel.wheelType);
	const defaults = historic
		? historicWheelMaterialRoles()
		: modernWheelMaterialRoles();
	return Object.freeze({
		tire: wheel.materialRoles.tire || defaults.tire,
		rim: wheel.materialRoles.rim || defaults.rim,
		spoke: wheel.materialRoles.spoke || defaults.spoke
	});
}

/** Normalizes one segment count into a finite integer at or above a topology-safe minimum. */
function boundedSegments(value, fallback, minimum) {
	const candidate = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(candidate)) {
		return fallback;
	}
	return Math.max(minimum, Math.round(candidate));
}

function historicWheelMaterialRoles() {
	return {
		tire: 'iron',
		rim: 'wood',
		spoke: 'wood'
	};
}

function modernWheelMaterialRoles() {
	return {
		tire: 'rubber',
		rim: 'rim-metal',
		spoke: 'rim-metal'
	};
}
