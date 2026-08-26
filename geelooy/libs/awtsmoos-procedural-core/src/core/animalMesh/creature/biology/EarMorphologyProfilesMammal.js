// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EarMorphologyProfilesMammal.js
 * @description Defines reusable mammalian ear morphology families without granting any species exclusive ownership of an ear shape.
 * The Awtsmoos lets one listening vessel become bovine leaf, equine spear, feline triangle, canine fold, or rabbit banner;
 * Awtsmoos.com keeps every proportion composable, so living form may wander freely through creature, chimera, wall, or stranger manner.
 */

export const MAMMAL_EAR_PROFILES = Object.freeze({
	bovine: profile(1.0, 0.56, 0.22, 0.24, 0.15, 0.1, 0.08),
	ovine: profile(0.92, 0.52, 0.24, 0.18, 0.2, 0.18, 0.12),
	caprine: profile(1.05, 0.48, 0.2, 0.34, 0.18, 0.08, 0.1),
	cervid: profile(1.28, 0.5, 0.25, 0.48, 0.1, 0.04, 0.08),
	elk: profile(1.2, 0.54, 0.24, 0.42, 0.08, 0.04, 0.08),
	antelope: profile(1.16, 0.44, 0.2, 0.52, 0.08, 0.02, 0.06),
	equine: profile(1.22, 0.42, 0.24, 0.64, 0.05, 0.02, 0.08),
	donkey: profile(1.58, 0.4, 0.26, 0.58, 0.06, 0.04, 0.08),
	canineErect: profile(1.1, 0.48, 0.2, 0.72, 0.02, 0.02, 0.1),
	canineFloppy: profile(1.36, 0.62, 0.18, 0.18, 0.9, 0.18, 0.18),
	feline: profile(0.82, 0.64, 0.2, 0.86, 0.02, 0.02, 0.08),
	lagomorph: profile(2.1, 0.38, 0.2, 0.72, 0.05, 0.02, 0.08),
	rodent: profile(0.72, 0.78, 0.2, 0.34, 0.02, 0.02, 0.12),
	primate: profile(0.64, 0.7, 0.34, 0.18, 0.02, 0.02, 0.2)
});

/**
 * Creates one normalized soft-ear morphology record.
 * @param {number} length Length relative to the baseline ear size.
 * @param {number} width Width relative to length.
 * @param {number} cup Concavity depth.
 * @param {number} point Tip sharpness.
 * @param {number} droop Gravity/flop amount.
 * @param {number} curl Rim curl amount.
 * @param {number} thickness Cartilage thickness ratio.
 * @returns {object} Frozen reusable morphology profile.
 */
function profile(length, width, cup, point, droop, curl, thickness) {
	return Object.freeze({
		cup,
		curl,
		droop,
		length,
		point,
		thickness,
		width
	});
}
