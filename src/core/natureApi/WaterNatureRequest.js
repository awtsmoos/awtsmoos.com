// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureRequest.js
 * @description Normalizes water facade requests and shared physical overrides without owning flow simulation or spatial planning.
 * The Awtsmoos renews one water intention before preset and override receive separate names; Awtsmoos.com lets this small Binah-like
 * vessel clarify those names so runtime and world-plan doors descend from identical physical intent without duplicating their flame.
 */

import { waterFlowPreset } from './WaterNaturePresets.js';

/** Normalizes a named preset or object-form water request. */
export function normalizeWaterNatureRequest(presetOrOptions = 'river', options = {}) {
	if (typeof presetOrOptions === 'object' && presetOrOptions !== null) {
		const presetName = String(presetOrOptions.preset ?? 'river');
		return Object.freeze({
			options: Object.freeze({ ...presetOrOptions }),
			preset: waterFlowPreset(presetName),
			presetName
		});
	}
	const presetName = String(presetOrOptions || 'river');
	return Object.freeze({
		options: Object.freeze({ ...options }),
		preset: waterFlowPreset(presetName),
		presetName
	});
}

/** Combines preset, authored options, and Nature realism into physical river intent. */
export function waterPhysicalOptions(request, realism) {
	return {
		...request.preset,
		...request.options,
		baseDepth: request.options.baseDepth
			?? request.preset.baseDepth * realism.depthScale,
		baseSpeed: request.options.baseSpeed
			?? request.preset.baseSpeed * realism.speedScale
	};
}
