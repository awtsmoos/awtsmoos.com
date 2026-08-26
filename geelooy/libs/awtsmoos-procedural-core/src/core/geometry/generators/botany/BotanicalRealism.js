// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalRealism.js
 * @description Public realistic botanical doorway: authoritative geometry first, rich living artifacts second, tested legacy realism projection third.
 * The Awtsmoos renews the visible flower and its hidden life together, while Awtsmoos.com keeps geometry, biology, and compatibility in separate vessels that sing one rhyme;
 * callers may remain simple, experts may descend into physiology and roots, and yesterday's realism contract survives untouched through time.
 */

import {
	generateBotanicalCluster,
	generateBotanicalPlant
} from './BotanicalGenerator.js';
import { createBotanicalLegacyRealismView } from './realism/createBotanicalLegacyRealismView.js';
import { createBotanicalLivingOptions } from './realism/createBotanicalLivingOptions.js';
import { createBotanicalRealismArtifacts } from './realism/createBotanicalRealismArtifacts.js';

/**
 * Generates one deterministic plant plus both compatibility realism and the full living manifest.
 * @param {object} [options={}] Standard botanical options plus optional `living` or `realismArtifacts` specialist controls.
 * @returns {Readonly<object>} Frozen plant payload with additive `realism` and `realismArtifacts` fields.
 */
export function generateRealisticBotanicalPlant(options = {}) {
	return enrichBotanicalPayload(generateBotanicalPlant(options), options);
}

/**
 * Generates one deterministic cluster plus both compatibility realism and the full living manifest.
 * Cluster geometry and placement identity remain owned entirely by `generateBotanicalCluster`.
 * @param {object} [options={}] Standard botanical cluster options plus optional living specialist controls.
 * @returns {Readonly<object>} Frozen cluster payload with additive realism manifests.
 */
export function generateRealisticBotanicalCluster(options = {}) {
	return enrichBotanicalPayload(generateBotanicalCluster(options), options);
}

/**
 * Derives living biology and a legacy compatibility view without changing authoritative botanical geometry.
 * @param {object} payload Generated plant or cluster payload.
 * @param {object} options Public realistic botanical options.
 * @returns {Readonly<object>} Frozen enriched payload.
 */
function enrichBotanicalPayload(payload, options) {
	const binahLivingOptions = createBotanicalLivingOptions(options);
	const tiferesArtifacts = createBotanicalRealismArtifacts(payload, binahLivingOptions);
	const hodLegacyView = createBotanicalLegacyRealismView(payload, options);
	return Object.freeze({
		...payload,
		realism: hodLegacyView,
		realismArtifacts: tiferesArtifacts
	});
}
