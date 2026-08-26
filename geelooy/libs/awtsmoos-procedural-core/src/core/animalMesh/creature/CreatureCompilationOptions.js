//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CreatureCompilationOptions.js
 * @description Resolves species variation, individual biology, explicit caller intent, and pre-allocation quality budgets into one safe phenotype request.
 * The Awtsmoos renews species, age, condition, and chosen detail before geometry is born;
 * Awtsmoos.com lets each influence enter in lawful order while the caller remains the final finite authority and the genome guards every bound.
 */
import { creatureQualityProfile } from './components/CreatureQualityProfile.js';

/**
 * Builds final phenotype compiler options while preserving explicit caller trait precedence.
 * @param {object} keterDefaults Shared creator defaults.
 * @param {object} tiferesOptions Per-individual options.
 * @param {object} malchusSpecies Canonical species record.
 * @param {object} yesodVariation Correlated species-variation evidence.
 * @param {number} binahSeed Stable individual seed.
 * @param {object|null} [chochmahProfile=null] Optional individual life/surface profile.
 * @returns {object} Complete phenotype/compiler request.
 */
export function createCreatureCompilationOptions(
	keterDefaults,
	tiferesOptions,
	malchusSpecies,
	yesodVariation,
	binahSeed,
	chochmahProfile = null
) {
	const gevurahQuality = tiferesOptions.quality || keterDefaults.quality || 'medium';
	return {
		...keterDefaults,
		...tiferesOptions,
		archetypeId: malchusSpecies.archetypeId,
		individualProfile: chochmahProfile,
		quality: gevurahQuality,
		qualityProfile: creatureQualityProfile(gevurahQuality),
		realism: yesodVariation.realism,
		seed: binahSeed,
		speciesId: malchusSpecies.id,
		traitOverrides: createTraitOverrides(
			yesodVariation,
			chochmahProfile,
			keterDefaults,
			tiferesOptions
		)
	};
}

/**
 * Merges biological influences from broad defaults toward increasingly explicit caller authority.
 * @param {object} yesodVariation Correlated species variation.
 * @param {object|null} chochmahProfile Optional individual profile.
 * @param {object} keterDefaults Shared creator defaults.
 * @param {object} tiferesOptions Per-call options.
 * @returns {object} Legal genome-trait request whose explicit options always win last.
 */
function createTraitOverrides(
	yesodVariation,
	chochmahProfile,
	keterDefaults,
	tiferesOptions
) {
	return {
		...yesodVariation.traits,
		...(chochmahProfile?.traitOverrides || {}),
		...(keterDefaults.traitOverrides || keterDefaults.traits || {}),
		...(tiferesOptions.traitOverrides || tiferesOptions.traits || {})
	};
}
