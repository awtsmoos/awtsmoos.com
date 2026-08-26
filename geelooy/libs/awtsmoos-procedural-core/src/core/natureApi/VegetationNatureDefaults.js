// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureDefaults.js
 * @description Translates high-level vegetation realism into neutral specialist options while preserving every explicit expert override.
 * The Awtsmoos renews hidden ecological intent before it becomes patch, preference, flower, or field;
 * Awtsmoos.com lets this Binah-like adapter reveal richer keilim without teaching lower engines about public realism names or stealing their yield.
 */

import {
	generateBotanicalCluster,
	generateBotanicalPlant
} from '../geometry/generators/botany/BotanicalGenerator.js';
import {
	generateRealisticBotanicalCluster,
	generateRealisticBotanicalPlant
} from '../geometry/generators/botany/BotanicalRealism.js';
import { vegetationRealismPolicy } from './NatureRealismPolicy.js';

/**
 * Resolves neutral patch options from one realism profile while explicit caller values remain sovereign.
 * @param {object} options Caller vegetation options, optionally including `ecology` overrides.
 * @param {string} realism Shared realism profile.
 * @returns {object} Generic patch options understood by ecosystem specialists.
 */
export function vegetationPatchOptions(options, realism) {
	const tiferesEcology = vegetationRealismPolicy(realism, options.ecology);
	return {
		patchAgeVariance: options.patchAgeVariance ?? tiferesEcology.ageVariance,
		patchClustering: options.patchClustering ?? tiferesEcology.clustering,
		patchCompetition: options.patchCompetition ?? tiferesEcology.competition,
		patchCount: options.patchCount,
		patchEdgeFalloff: options.patchEdgeFalloff ?? tiferesEcology.edgeFalloff,
		patchiness: options.patchiness ?? tiferesEcology.patchiness,
		patchRadius: options.patchRadius,
		patchSuccession: options.patchSuccession ?? tiferesEcology.succession
	};
}

/**
 * Resolves grass habitat preferences without overwriting caller-provided moisture behavior.
 * @param {object} options Grass options containing optional `preferences` and `ecology`.
 * @param {string} realism Shared realism profile.
 * @returns {object} Grass-planner preference map with a realism-sensitive moisture weight.
 */
export function vegetationGrassPreferences(options, realism) {
	const tiferesEcology = vegetationRealismPolicy(realism, options.ecology);
	const orosPreferences = options.preferences ?? {};
	if (orosPreferences.moisture !== undefined) return orosPreferences;
	return {
		...orosPreferences,
		moisture: {
			weight: 0.5 + tiferesEcology.moistureResponse * 1.5
		}
	};
}

/** Chooses the authoritative one-plant generator for a realism profile. */
export function botanicalPlantGenerator(realism) {
	return realism === 'stylized'
		? generateBotanicalPlant
		: generateRealisticBotanicalPlant;
}

/** Chooses the authoritative botanical-cluster generator for a realism profile. */
export function botanicalClusterGenerator(realism) {
	return realism === 'stylized'
		? generateBotanicalCluster
		: generateRealisticBotanicalCluster;
}

/** Summarizes a native botanical payload without translating or flattening it. */
export function botanicalNatureDiagnostics(value, species) {
	return {
		partCount: value.parts?.length ?? value.payload?.parts?.length ?? 0,
		realismEvidence: Boolean(value.realism),
		species
	};
}
