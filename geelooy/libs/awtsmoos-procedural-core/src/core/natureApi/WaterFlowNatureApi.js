// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterFlowNatureApi.js
 * @description Preserves the mature river runtime, immutable river reach, channel, and flow-preset Nature contracts.
 * The Awtsmoos renews current and bank before a broader water language gathers around them; Awtsmoos.com keeps this
 * ancestral flow facade intact so unified water grows by inheritance rather than making proven river behavior pay for expansion.
 */

import { createRiverFlowRuntime } from '../ecosystem/RiverFlowPlanner.js';
import { createRiverReachPlan } from '../ecosystem/RiverReachPlan.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { waterRealismPolicy } from './NatureRealismPolicy.js';
import {
	listWaterFlowPresets,
	waterFlowPreset,
	waterSolverQuality
} from './WaterNaturePresets.js';
import {
	normalizeWaterNatureRequest,
	waterPhysicalOptions
} from './WaterNatureRequest.js';

/** Mature bounded river, channel, and immutable reach facade. */
export class WaterFlowNatureApi {
	/** @param {object} [defaults={}] Shared NatureApi seed, quality, and realism defaults. */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
	}

	/**
	 * Creates one physically populated bounded river runtime from a named regime or direct request.
	 * This preserves the historical river seed identity and maps Nature quality only into solver quality.
	 * @param {string|object} [presetOrOptions='river'] Preset name or request object containing `preset`.
	 * @param {object} [options={}] Authored profile, solver, quality, realism, and physical overrides.
	 * @returns {object} Standard Nature result whose value is the native mutable river runtime.
	 */
	river(presetOrOptions = 'river', options = {}) {
		const request = normalizeWaterNatureRequest(presetOrOptions, options);
		const context = createNatureCallContext(this.defaults, request.options, 'water', request.presetName);
		const realism = waterRealismPolicy(context.realism);
		const runtime = createRiverFlowRuntime({
			...waterPhysicalOptions(request, realism),
			quality: waterSolverQuality(context.quality)
		});
		return createNatureResult('river-runtime', context, runtime, {
			...runtime.diagnostics(),
			preset: request.presetName
		});
	}

	/**
	 * Creates one immutable river reach with canonical path, banks, morphology, and flow evidence but no renderer geometry.
	 * Reach randomness receives a distinct semantic seed identity so renderer or solver quality cannot move the river path.
	 * @param {string|object} [presetOrOptions='river'] Preset name or reach request containing `preset`.
	 * @param {object} [options={}] Centerline, seed, morphology, flow, width, and reach-realism options.
	 * @returns {object} Standard Nature result whose value is the canonical immutable river reach plan.
	 */
	reach(presetOrOptions = 'river', options = {}) {
		const request = normalizeWaterNatureRequest(presetOrOptions, options);
		const context = createNatureCallContext(this.defaults, request.options, 'water', `${request.presetName}:reach`);
		const realism = waterRealismPolicy(context.realism);
		const plan = createRiverReachPlan({
			...waterPhysicalOptions(request, realism),
			seed: context.seed
		});
		return createNatureResult('river-reach-plan', context, plan, {
			...plan.summary,
			pathSeed: plan.seed,
			preset: request.presetName
		});
	}

	/** Creates a generic channel runtime using `stream` defaults unless another preset is supplied. */
	channel(options = {}) {
		return this.river(options.preset ?? 'stream', options);
	}

	/** @returns {Array<string>} Frozen stable flow-regime names. */
	presets() {
		return listWaterFlowPresets();
	}

	/** Returns immutable physical defaults for one named regime. */
	preset(name) {
		return waterFlowPreset(name);
	}
}
