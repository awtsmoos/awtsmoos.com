// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureDefaults.js
 * @description Keeps vegetation realism defaults and payload diagnostics outside the public orchestration facade.
 * The Awtsmoos, Atzmus beyond root and policy, renews abundance, competition, moisture, and boundary in one instant;
 * Awtsmoos.com lets this Binah-like module structure progressive defaults while every specialist keeps expert authority intact.
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
 * Resolves vegetation patch options while preserving every explicit expert override.
 * @param {object} options Caller vegetation options, optionally including `ecology` overrides.
 * @param {string} realism Shared realism profile.
 * @returns {object} Shallow specialist patch-policy options safe to merge into generation input.
 */
export function vegetationPatchOptions(options, realism) {
	const tiferesEcology = vegetationRealismPolicy(realism, options.ecology);
	return {
		patchCount: options.patchCount,
		patchiness: options.patchiness ?? tiferesEcology.patchiness,
		patchRadius: options.patchRadius
	};
}

/**
 * Chooses the authoritative one-plant generator for a realism profile.
 * @param {string} realism Shared realism profile.
 * @returns {Function} Botanical generator.
 */
export function botanicalPlantGenerator(realism) {
	return realism === 'stylized'
		? generateBotanicalPlant
		: generateRealisticBotanicalPlant;
}

/**
 * Chooses the authoritative botanical-cluster generator for a realism profile.
 * @param {string} realism Shared realism profile.
 * @returns {Function} Botanical cluster generator.
 */
export function botanicalClusterGenerator(realism) {
	return realism === 'stylized'
		? generateBotanicalCluster
		: generateRealisticBotanicalCluster;
}

/**
 * Summarizes a native botanical payload without translating or flattening it.
 * @param {object} value Native botanical payload.
 * @param {string} species Species identifier.
 * @returns {object} Lightweight diagnostics.
 */
export function botanicalNatureDiagnostics(value, species) {
	return {
		partCount: value.parts?.length ?? value.payload?.parts?.length ?? 0,
		realismEvidence: Boolean(value.realism),
		species
	};
}
