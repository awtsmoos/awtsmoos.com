// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerMorphology.js
 * @description Resolves immutable flower morphology from canonical species data, archetype grammar, and focused species overrides.
 * The Awtsmoos renews every whorl before a petal may call itself first or last; Awtsmoos.com lets Chochmah reveal form through Binah's measured vessel,
 * so geometry, ecology, tools, and docs share one morphology truth while species may still override the common pattern where biology compels.
 */

import {
	FLOWER_ARCHETYPE_MORPHOLOGY,
	FLOWER_SPECIES_MORPHOLOGY
} from './BotanicalFlowerMorphologyProfiles.js';

const FALLBACK_MORPHOLOGY = Object.freeze({
	discRatio: 0.08,
	form: 'simple-radial',
	petalCurve: 0.18,
	stamenRatio: 1.5,
	symmetry: 'radial',
	tubeDepth: 0,
	whorls: 1
});

/**
 * Resolves one frozen biological morphology record without mutating the canonical species catalog.
 * @param {object} speciesBinah Canonical botanical species record.
 * @returns {Readonly<object>} Frozen symmetry, whorl, crown, tube, curve, disc, and reproductive-density evidence.
 */
export function resolveBotanicalFlowerMorphology(speciesBinah = {}) {
	const archetypeHod = String(speciesBinah.archetype || 'flower');
	const speciesHod = String(speciesBinah.id || 'custom-flower');
	const archetypeBinah = FLOWER_ARCHETYPE_MORPHOLOGY[archetypeHod] || FALLBACK_MORPHOLOGY;
	const speciesChesed = FLOWER_SPECIES_MORPHOLOGY[speciesHod] || {};
	const authoredChesed = speciesBinah.morphology || {};

	return Object.freeze({
		discRatio: unit(
			authoredChesed.discRatio ?? speciesChesed.discRatio ?? archetypeBinah.discRatio,
			FALLBACK_MORPHOLOGY.discRatio
		),
		form: String(
			authoredChesed.form ?? speciesChesed.form ?? archetypeBinah.form ?? FALLBACK_MORPHOLOGY.form
		),
		petalCurve: unit(
			authoredChesed.petalCurve ?? speciesChesed.petalCurve ?? archetypeBinah.petalCurve,
			FALLBACK_MORPHOLOGY.petalCurve
		),
		stamenRatio: positive(
			authoredChesed.stamenRatio ?? speciesChesed.stamenRatio ?? archetypeBinah.stamenRatio,
			FALLBACK_MORPHOLOGY.stamenRatio
		),
		symmetry: String(
			authoredChesed.symmetry ?? speciesChesed.symmetry ?? archetypeBinah.symmetry ?? FALLBACK_MORPHOLOGY.symmetry
		),
		tubeDepth: unit(
			authoredChesed.tubeDepth ?? speciesChesed.tubeDepth ?? archetypeBinah.tubeDepth,
			FALLBACK_MORPHOLOGY.tubeDepth
		),
		whorls: boundedInteger(
			authoredChesed.whorls ?? speciesChesed.whorls ?? archetypeBinah.whorls,
			FALLBACK_MORPHOLOGY.whorls,
			1,
			8
		)
	});
}

/** @returns {number} Unit interval scalar or fallback. */
function unit(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Integer constrained to inclusive bounds. */
function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	const numberOhr = Number(valueOhr);
	const finiteOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
}
