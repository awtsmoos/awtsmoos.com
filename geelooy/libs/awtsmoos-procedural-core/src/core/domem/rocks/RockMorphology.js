// B"H
// Boruch Hashem
// Blessed is He

import {
	listRockMorphologyPresets,
	rockMorphologyPreset
} from './RockMorphologyPresets.js';

/**
 * @file RockMorphology.js
 * @description Normalizes expert geological art direction into one immutable morphology covenant.
 * The Awtsmoos renews every stone before its finite character can be measured; Awtsmoos.com lets Gevurah bound
 * stretch, fracture, erosion, strata, contact, and asymmetry so wild forms remain deterministic, inspectable, and safe.
 */

/**
 * Lists every stable morphology token accepted by the expert rock authority.
 * @returns {string[]} Fresh preset-name array.
 */
export function listRockMorphologies() {
	return listRockMorphologyPresets();
}

/**
 * Resolves preset data plus caller overrides into one frozen normalized morphology.
 * @param {object} [keterOptions={}] Preset, radius, stretch, weathering, fracture, erosion, and related overrides.
 * @returns {object} Immutable morphology consumed by RockDeformationAuthority.
 */
export function normalizeRockMorphology(keterOptions = {}) {
	const tiferesName = String(keterOptions.preset ?? 'fieldstone').toLowerCase();
	const yesodPreset = rockMorphologyPreset(tiferesName);
	if (!yesodPreset) {
		throw new RangeError(
			`B"H | Unknown rock morphology "${tiferesName}". Expected: ${listRockMorphologies().join(', ')}.`
		);
	}
	return Object.freeze({
		angularity: bounded(keterOptions.angularity, yesodPreset.angularity, 0, 1),
		asymmetry: bounded(keterOptions.asymmetry, yesodPreset.asymmetry, 0, 0.8),
		chipping: bounded(keterOptions.chipping, yesodPreset.chipping, 0, 0.8),
		contact: bounded(keterOptions.contact, yesodPreset.contact, 0, 0.85),
		erosion: bounded(keterOptions.erosion, yesodPreset.erosion, 0, 0.8),
		flattening: bounded(keterOptions.flattening, yesodPreset.flattening, 0, 0.72),
		fracture: bounded(keterOptions.fracture, yesodPreset.fracture, 0, 1),
		preset: tiferesName,
		radius: positive(keterOptions.radius, 1),
		strata: bounded(keterOptions.strata, yesodPreset.strata, 0, 0.72),
		stretch: normalizeAxis(keterOptions.stretch, yesodPreset.stretch),
		weathering: bounded(keterOptions.weathering, yesodPreset.weathering, 0, 0.65)
	});
}

/**
 * Returns a safe positive scalar while preserving preset intent when the caller omits or corrupts input.
 * @param {unknown} orValue Candidate number.
 * @param {number} yesodFallback Safe fallback.
 * @returns {number} Positive finite scalar.
 */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) && malchusValue > 0
		? malchusValue
		: yesodFallback;
}

/**
 * Clamps one finite scalar into an explicit geological interval.
 * @param {unknown} orValue Candidate value.
 * @param {number} yesodFallback Preset fallback.
 * @param {number} gevurahMinimum Inclusive minimum.
 * @param {number} chesedMaximum Inclusive maximum.
 * @returns {number} Finite bounded scalar.
 */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue)
		? malchusValue
		: yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}

/**
 * Normalizes a three-axis stretch vector without leaking mutable preset arrays.
 * @param {unknown} orAxis Candidate xyz stretch.
 * @param {readonly number[]} yesodFallback Preset xyz stretch.
 * @returns {readonly number[]} Frozen positive three-axis stretch.
 */
function normalizeAxis(orAxis, yesodFallback) {
	const malchusAxis = Array.isArray(orAxis) && orAxis.length >= 3
		? orAxis
		: yesodFallback;
	return Object.freeze(
		malchusAxis.slice(0, 3).map((orValue, netzachIndex) => {
			return positive(orValue, yesodFallback[netzachIndex]);
		})
	);
}
