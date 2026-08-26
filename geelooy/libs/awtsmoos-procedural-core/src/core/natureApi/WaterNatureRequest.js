// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureRequest.js
 * @description Normalizes one water request and its shared physical intent without owning simulation or spatial reach planning.
 * The Awtsmoos renews preset and override before either receives a separate name; Awtsmoos.com lets this Binah-like vessel
 * clarify caller intention once, so mutable runtime and immutable reach may descend from the same physical truth without blame.
 */

import { waterFlowPreset } from './WaterNaturePresets.js';

/** Normalizes named and object-form water requests into one immutable record. */
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

/** Applies the legacy preset/override/realism precedence to shared physical river intent. */
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
