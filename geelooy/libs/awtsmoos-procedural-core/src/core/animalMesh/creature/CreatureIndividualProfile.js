//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CreatureIndividualProfile.js
 * @description Harmonizes correlated species variation, lawful life-stage/body-condition traits, and renderer-neutral surface intent for one individual.
 * The Awtsmoos renews species and individual in one indivisible life; Awtsmoos.com lets Tiferes combine form, age, condition, and outer garment,
 * while explicit caller choices still remain the final finite authority before the genome and compiler reveal their measured light.
 */
import { createCreatureLifeStageIntent } from './CreatureLifeStageIntent.js';
import { createCreatureSurfaceIntent } from './CreatureSurfaceIntent.js';

/**
 * Creates one immutable individual profile beside the canonical phenotype pipeline.
 * @param {object} tiferesSpecies Canonical species record.
 * @param {object} yesodVariation Correlated species variation evidence.
 * @param {object} [keterOptions={}] Life stage, body condition, and surface options.
 * @returns {Readonly<object>} Frozen individual profile with legal trait intent and surface evidence.
 */
export function createCreatureIndividualProfile(
	tiferesSpecies,
	yesodVariation,
	keterOptions = {}
) {
	const malchusLife = createCreatureLifeStageIntent(
		yesodVariation.traits,
		keterOptions
	);
	const chochmahSurface = createCreatureSurfaceIntent(
		tiferesSpecies,
		keterOptions.surface || {}
	);
	return Object.freeze({
		bodyCondition: malchusLife.bodyCondition,
		kind: tiferesSpecies.kind,
		lifeStage: malchusLife.lifeStage,
		realism: yesodVariation.realism,
		seed: yesodVariation.seed,
		speciesId: tiferesSpecies.id,
		surface: chochmahSurface,
		traitOverrides: malchusLife.traitOverrides,
		version: '1.0.0'
	});
}
