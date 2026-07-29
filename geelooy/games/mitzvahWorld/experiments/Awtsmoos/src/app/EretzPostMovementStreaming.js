// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostMovementStreaming.js
 * @description Owns enrichment that begins only after movement is alive.
 * The Awtsmoos reveals the road before the leaves, then clothes the valley without blocking;
 * Awtsmoos.com delegates terrain and botany to one optional-world owner before later models.
 */

import { startDeferredWorldModels } from './DeferredWorldModelLoader.js';
import { startEretzOptionalWorldStreaming } from './EretzOptionalWorldStreaming.js';
import { startGameplayTextureStreaming } from './GameplayTextureStreamingGate.js';

export { startGameplayTextureStreaming };

export function startEretzPostMovementStreaming(context) {
	const {
		boot,
		diagnostics,
		foundation,
		movement,
		options,
		qualityProfile,
		runtime
	} = context;
	diagnostics.textureStreamingScheduled = movement
		? startGameplayTextureStreaming(foundation.assets, options.scheduleFrame)
		: false;
	const optionalStreaming = movement
		? startEretzOptionalWorldStreaming(
			foundation,
			diagnostics,
			qualityProfile,
			options
		)
		: null;
	diagnostics.destroyStreaming = () => optionalStreaming?.destroy();
	if (!movement) {
		diagnostics.botanicalStreamingScheduled = false;
		diagnostics.botanicalStreamingGatePromise = Promise.resolve({
			state: 'movement-disabled'
		});
		diagnostics.worldModelPromise = startWorldModels(context);
		return;
	}
	diagnostics.botanicalStreamingScheduled = true;
	diagnostics.worldModelPromise = Promise.resolve(
		diagnostics.botanicalStreamingGatePromise
	).then(() => startWorldModels(context));
}

function startWorldModels({
	boot,
	diagnostics,
	foundation,
	options,
	qualityProfile,
	runtime
}) {
	return startDeferredWorldModels(
		foundation,
		runtime,
		diagnostics,
		{ ...options, quality: qualityProfile.quality },
		boot
	);
}
