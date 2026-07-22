// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostMovementStreaming.js
 * @description Owns every enrichment that begins only after movement is alive.
 * The Awtsmoos reveals the road before the leaves, then clothes the valley without blocking
 * the Shliach; Awtsmoos.com binds botany, textures, models, and optional districts in order.
 */

import { startDeferredWorldModels } from './DeferredWorldModelLoader.js';
import { startEretzBotanicalStreaming } from './EretzBotanicalStreaming.js';
import { startEretzOptionalWorldStreaming } from './EretzOptionalWorldStreaming.js';
import { startGameplayTextureStreaming } from './GameplayTextureStreamingGate.js';

export { startGameplayTextureStreaming };

export function startEretzPostMovementStreaming(context) {
	const { boot, diagnostics, foundation, movement, options, qualityProfile, runtime } = context;
	diagnostics.textureStreamingScheduled = movement
		? startGameplayTextureStreaming(foundation.assets, options.scheduleFrame)
		: false;
	const optionalStreaming = movement
		? startEretzOptionalWorldStreaming(foundation, diagnostics, qualityProfile, options)
		: null;
	diagnostics.destroyStreaming = () => optionalStreaming?.destroy();
	if (!movement) {
		diagnostics.botanicalStreamingScheduled = false;
		diagnostics.botanicalStreamingGatePromise = Promise.resolve();
		diagnostics.worldModelPromise = startWorldModels(context);
		return;
	}
	startEretzBotanicalStreaming(foundation, diagnostics, qualityProfile);
	diagnostics.botanicalStreamingScheduled = true;
	diagnostics.botanicalStreamingGatePromise = Promise.resolve(
		diagnostics.botanicalEnrichmentPromise
	);
	diagnostics.worldModelPromise = diagnostics.botanicalStreamingGatePromise
		.then(() => startWorldModels(context));
}

function startWorldModels({ boot, diagnostics, foundation, options, qualityProfile, runtime }) {
	return startDeferredWorldModels(
		foundation,
		runtime,
		diagnostics,
		{ ...options, quality: qualityProfile.quality },
		boot
	);
}
