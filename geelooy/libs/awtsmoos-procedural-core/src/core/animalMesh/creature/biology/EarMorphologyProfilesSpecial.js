// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EarMorphologyProfilesSpecial.js
 * @description Defines extreme, reduced, membrane-like, and fantasy ear families beyond ordinary mammalian leaf ears.
 * The Awtsmoos lets listening become vast elephant fan, folded bat membrane, tiny pinniped opening, or dragon frill;
 * Awtsmoos.com preserves one semantic grammar so even impossible creatures may receive lawful ears by will.
 */

export const SPECIAL_EAR_PROFILES = Object.freeze({
	bat: profile(1.7, 0.62, 0.34, 0.74, 0.04, 0.16, 0.04, "membrane"),
	elephant: profile(2.2, 1.35, 0.12, 0.06, 0.38, 0.08, 0.04, "fan"),
	pinniped: profile(0.18, 0.28, 0.08, 0.04, 0.02, 0.02, 0.1, "reduced"),
	aquaticReduced: profile(0.12, 0.22, 0.06, 0.02, 0, 0, 0.08, "opening"),
	fantasyPointed: profile(1.65, 0.34, 0.18, 0.98, 0.03, 0.08, 0.06, "leaf"),
	goblinLong: profile(2.35, 0.28, 0.16, 0.9, 0.22, 0.14, 0.06, "leaf"),
	dragonFrill: profile(1.5, 1.15, 0.1, 0.62, 0.1, 0.2, 0.035, "membrane"),
	faeWingEar: profile(1.4, 0.72, 0.08, 0.88, 0.04, 0.16, 0.025, "membrane"),
	roundedFantasy: profile(0.92, 0.9, 0.3, 0.04, 0.05, 0.1, 0.08, "fan")
});

/**
 * Creates one normalized special-ear record.
 * @param {number} length Relative ear length.
 * @param {number} width Relative width.
 * @param {number} cup Concavity depth.
 * @param {number} point Tip sharpness.
 * @param {number} droop Droop amount.
 * @param {number} curl Rim curl amount.
 * @param {number} thickness Thickness ratio.
 * @param {string} topology Preferred local ear topology family.
 * @returns {object} Frozen morphology profile.
 */
function profile(length, width, cup, point, droop, curl, thickness, topology) {
	return Object.freeze({
		cup,
		curl,
		droop,
		length,
		point,
		thickness,
		topology,
		width
	});
}
