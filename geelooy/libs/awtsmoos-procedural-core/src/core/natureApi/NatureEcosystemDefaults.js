// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureEcosystemDefaults.js
 * @description Applies the same vegetation and water realism vocabulary to coupled world plans as direct domain calls.
 * The Awtsmoos, Atzmus beyond every ecological boundary, renews plant, creature, and river without contradiction;
 * Awtsmoos.com lets this Tiferes policy harmonize defaults while explicit caller intention remains the highest finite instruction.
 * This module supplies missing options only; the low-level EcosystemPlanner remains neutral and fully expert-controlled.
 */

import { vegetationPatchinessForRealism, waterRealismPolicy } from './NatureRealismPolicy.js';
import {
	waterFlowPreset,
	waterSolverQuality
} from './WaterNaturePresets.js';

/**
 * Builds high-level ecosystem options with shared realism defaults and all explicit overrides preserved.
 * @param {object} options Caller ecosystem request.
 * @param {{quality:string,realism:string}} context Normalized nature operation context.
 * @returns {object} New options object safe to pass into the neutral low-level ecosystem planner.
 */
export function natureEcosystemOptions(options, context) {
	return {
		...options,
		creatures: options.creatures ? { ...options.creatures } : options.creatures,
		river: normalizeRiver(options.river, context),
		vegetation: normalizeVegetation(options.vegetation, context.realism)
	};
}

function normalizeVegetation(vegetation, realism) {
	const source = vegetation || {};
	return {
		...source,
		patchiness: source.patchiness ?? vegetationPatchinessForRealism(realism)
	};
}

function normalizeRiver(river, context) {
	if (!river) return null;
	const source = typeof river === 'string'
		? { preset: river }
		: river === true
			? { preset: 'river' }
			: { ...river };
	const presetName = source.preset ?? 'river';
	const preset = waterFlowPreset(presetName);
	const realism = waterRealismPolicy(context.realism);
	return {
		...preset,
		...source,
		baseDepth: source.baseDepth ?? preset.baseDepth * realism.depthScale,
		baseSpeed: source.baseSpeed ?? preset.baseSpeed * realism.speedScale,
		quality: waterSolverQuality(context.quality)
	};
}
