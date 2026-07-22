// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostMovementStreaming.js
 * @description Owns every enrichment that must begin only after movement is alive.
 * The Awtsmoos reveals the road before the leaves, then clothes the valley without blocking
 * the Shliach; Awtsmoos.com binds botany, textures, models, and optional districts in order.
 */

import { startDeferredWorldModels } from './DeferredWorldModelLoader.js';
import { startEretzBotanicalStreaming } from './EretzBotanicalStreaming.js';
import { startEretzOptionalWorldStreaming } from './EretzOptionalWorldStreaming.js';

/**
 * Starts all nonessential world work after the runtime loop has already awakened.
 *
 * @param {object} context - Current runtime, diagnostics, foundation, and policy vessels.
 * @returns {void}
 */
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

/** Starts texture enrichment after two visible animation-frame handoffs. */
export function startGameplayTextureStreaming(assets, scheduleFrame = frameScheduler) {
	const stream = assets?.publicMaterialStreaming;
	if (typeof stream?.start !== 'function') return false;
	scheduleFrame(() => scheduleFrame(() => stream.start()));
	return true;
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

function frameScheduler(callback) {
	if (typeof requestAnimationFrame === 'function') {
		return requestAnimationFrame(callback);
	}
	return setTimeout(callback, 0);
}
