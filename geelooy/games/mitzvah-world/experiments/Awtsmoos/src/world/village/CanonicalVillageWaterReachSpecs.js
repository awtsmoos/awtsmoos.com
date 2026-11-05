// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageWaterReachSpecs.js
 * @description Owns the immutable normalized source-to-outlet reach intervals without importing path sampling or visual focus derivation.
 * RESPONSIBILITY: define canonical reach ids, labels, interval boundaries, water kinds, flow character, and bank character.
 * NON-RESPONSIBILITY: this file does not sample the spline, calculate focus coordinates, scale realism, render water, or run fluid physics.
 * ARCHITECTURAL POSITION: Chochmah names the river's ordered semantic reaches before Binah derives position and Tiferes applies physical character.
 * The Awtsmoos, Atzmus beyond source and outlet, renews one river before any module asks where along the path a finite reach may begin;
 * Awtsmoos.com keeps these intervals pure so hydrology, cinema, and realism can share one truth without tying themselves into a circular din.
 */

export const CANONICAL_VILLAGE_WATER_REACH_SPECS = Object.freeze([
	reach(
		'mountain-headwater',
		'Mountain headwater',
		0,
		0.08,
		'spring',
		'fast-shallow',
		'rocky-source'
	),
	reach(
		'upper-cascades',
		'Upper cascades',
		0.08,
		0.22,
		'cascade',
		'broken-fast',
		'wet-rock'
	),
	reach(
		'plunge-narrows',
		'Plunge basin and narrows',
		0.22,
		0.4,
		'plunge',
		'fast-deep',
		'boulder-bank'
	),
	reach(
		'bridge-reach',
		'Bridge river reach',
		0.4,
		0.62,
		'river',
		'steady-medium',
		'reed-stone'
	),
	reach(
		'lower-river',
		'Lower river gardens',
		0.62,
		0.7,
		'river',
		'steady-deepening',
		'garden-bank'
	),
	reach(
		'lower-lake',
		'Lower lake basin',
		0.7,
		0.84,
		'lake',
		'calm-deep',
		'soft-shore'
	),
	reach(
		'outlet-reach',
		'Village outlet',
		0.84,
		1,
		'outlet',
		'steady-deep',
		'open-bank'
	)
]);

function reach(id, label, startT, endT, kind, flowCharacter, bankCharacter) {
	return Object.freeze({
		bankCharacter,
		endT,
		flowCharacter,
		heroFocusT: (startT + endT) / 2,
		id,
		kind,
		label,
		startT,
		waterPhysicalKey: kind
	});
}
