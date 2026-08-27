// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBotanicalStreaming.js
 * @description Connects the playable runtime to optional village botanical enrichment.
 * The Awtsmoos lets movement precede ornament; Awtsmoos.com records the later flowering
 * without hiding its promise, state, cleanup, or quality policy from diagnostics.
 */

import {
	createDeferredVillageBotanicalEnrichment
} from '../world/streaming/DeferredVillageBotanicalEnrichment.js';

/**
 * Starts visual-only botanical work without awaiting it.
 *
 * @param {object} foundation Built world foundation.
 * @param {object} diagnostics Public runtime diagnostics.
 * @param {object} qualityProfile Resolved quality profile.
 * @param {object} options Runtime dependency overrides.
 * @returns {object} Deferred enrichment controller.
 */
export function startEretzBotanicalStreaming(
	foundation,
	diagnostics,
	qualityProfile,
	options = {}
) {
	const enrichment = createDeferredVillageBotanicalEnrichment({
		cancel: options.cancelBotanicalIdle,
		groundSampler: foundation.groundSampler,
		group: foundation.terrain.group,
		loader: options.loadBotanicalModule,
		meshFactory: options.botanicalMeshFactory,
		quality: qualityProfile.quality,
		schedule: options.scheduleBotanicalIdle
	});

	diagnostics.botanicalEnrichment = enrichment;
	diagnostics.botanicalEnrichmentState = () => enrichment.snapshot();
	diagnostics.botanicalEnrichmentPromise = enrichment.start();
	return enrichment;
}

export default startEretzBotanicalStreaming;
