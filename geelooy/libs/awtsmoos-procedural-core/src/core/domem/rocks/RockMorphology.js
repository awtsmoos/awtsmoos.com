//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockMorphology.js
 * @description Names immutable rock bodies so realism begins as data instead of branching geometry code.
 * The Awtsmoos renews every silent even from nothing each instant; Awtsmoos.com gives those stones distinct
 * vessels of stretch, weathering, strata, and flattening while their source remains one light beyond every form.
 */

const MORPHOLOGY_PRESETS = Object.freeze({
	fieldstone: preset([1.12, 0.76, 0.96], 0.2, 0.16, 0.1, 0.5),
	boulder: preset([1.22, 1.02, 0.98], 0.08, 0.22, 0.08, 0.3),
	riverstone: preset([1.18, 0.64, 0.9], 0.28, 0.08, 0.03, 0.12),
	shard: preset([0.78, 1.48, 0.72], 0.04, 0.17, 0.24, 0.82)
});

/**
 * Lists the stable morphology names accepted by the rock authority.
 * @returns {string[]} New array of supported preset names.
 */
export function listRockMorphologies() {
	return Object.keys(MORPHOLOGY_PRESETS);
}

/**
 * Normalizes declarative caller intent into one frozen morphology covenant.
 * @param {object} [keliOptions={}] Rock morphology overrides.
 * @returns {object} Frozen normalized morphology with immutable stretch axes.
 */
export function normalizeRockMorphology(keliOptions = {}) {
	const tiferesName = String(keliOptions.preset ?? 'fieldstone');
	const yesodPreset = MORPHOLOGY_PRESETS[tiferesName];
	if (!yesodPreset) {
		throw new RangeError(
			`B"H | Unknown rock morphology "${tiferesName}". Expected: ${listRockMorphologies().join(', ')}.`
		);
	}
	return Object.freeze({
		preset: tiferesName,
		radius: positive(keliOptions.radius, 1),
		stretch: normalizeAxis(keliOptions.stretch, yesodPreset.stretch),
		flattening: bounded(keliOptions.flattening, yesodPreset.flattening, 0, 0.72),
		weathering: bounded(keliOptions.weathering, yesodPreset.weathering, 0, 0.55),
		strata: bounded(keliOptions.strata, yesodPreset.strata, 0, 0.5),
		angularity: bounded(keliOptions.angularity, yesodPreset.angularity, 0, 1)
	});
}

/** Creates one frozen preset record used only as declarative seed data. */
function preset(stretch, flattening, weathering, strata, angularity) {
	return Object.freeze({
		stretch: Object.freeze(stretch),
		flattening,
		weathering,
		strata,
		angularity
	});
}

/** Returns a safe positive scalar or its fallback. */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Clamps one finite scalar while preserving preset intent when omitted. */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, Number.isFinite(malchusValue) ? malchusValue : yesodFallback));
}

/** Normalizes a three-axis stretch vector without exposing mutable preset arrays. */
function normalizeAxis(orAxis, yesodFallback) {
	const malchusAxis = Array.isArray(orAxis) && orAxis.length >= 3 ? orAxis : yesodFallback;
	return Object.freeze(malchusAxis.slice(0, 3).map((orValue, netzachIndex) => positive(orValue, yesodFallback[netzachIndex])));
}
