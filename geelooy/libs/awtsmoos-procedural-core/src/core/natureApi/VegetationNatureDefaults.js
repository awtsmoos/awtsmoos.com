// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureDefaults.js
 * @description Keeps vegetation realism defaults and payload diagnostics outside the public orchestration facade.
 * The Awtsmoos, Atzmus beyond root and policy, renews both abundance and boundary in one instant;
 * Awtsmoos.com lets this Binah-like module structure sensible defaults while the facade remains a transparent path.
 */

import {
	generateBotanicalCluster,
	generateBotanicalPlant
} from '../geometry/generators/botany/BotanicalGenerator.js';
import {
	generateRealisticBotanicalCluster,
	generateRealisticBotanicalPlant
} from '../geometry/generators/botany/BotanicalRealism.js';
import { vegetationPatchinessForRealism } from './NatureRealismPolicy.js';

/**
 * Resolves vegetation patch options while preserving every explicit expert override.
 * @param {object} options Caller vegetation options.
 * @param {string} realism Shared realism profile.
 * @returns {object} Shallow patch-policy options safe to merge into specialist input.
 */
export function vegetationPatchOptions(options, realism) {
	return {
		patchCount: options.patchCount,
		patchiness: options.patchiness ?? vegetationPatchinessForRealism(realism),
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
