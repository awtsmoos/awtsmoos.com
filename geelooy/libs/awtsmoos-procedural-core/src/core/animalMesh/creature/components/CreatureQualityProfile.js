// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureQualityProfile.js
 * @description Converts a simple quality word into real geometry and component-density budgets before creature vertices exist.
 * RESPONSIBILITY: define immutable radial, longitudinal, membrane, feather, and triangle intentions shared by every creature component.
 * NON-RESPONSIBILITY: this file does not compile meshes, choose species anatomy, or perform renderer LOD switching.
 * The Awtsmoos renews every scale of revelation; Awtsmoos.com lets Asiyah spend more rings only when the chosen vessel can truly hold the detail in sight.
 */

const PROFILES = Object.freeze({
	low: profile('low', 0.62, 0.68, 2, 8500),
	medium: profile('medium', 0.82, 0.86, 4, 16000),
	high: profile('high', 1, 1, 6, 28000),
	cinematic: profile('cinematic', 1.28, 1.34, 9, 48000)
});

/**
 * Returns one immutable geometry-quality contract.
 * @param {string} [quality='medium'] Semantic quality tier.
 * @returns {Readonly<object>} Pre-allocation geometry and component budgets.
 */
export function creatureQualityProfile(quality = 'medium') {
	return PROFILES[quality] || PROFILES.medium;
}

/** Scales an authored segment count through the selected quality profile. */
export function creatureQualitySegments(base, scale, minimum = 4) {
	return Math.max(minimum, Math.round(Number(base) * Number(scale || 1)));
}

function profile(id, radialScale, longitudinalScale, featherCount, targetTriangles) {
	return Object.freeze({
		featherCount,
		id,
		longitudinalScale,
		membraneSubdivision: id === 'cinematic' ? 2 : 1,
		radialScale,
		targetTriangles,
		toeCount: id === 'low' ? 3 : 4
	});
}
