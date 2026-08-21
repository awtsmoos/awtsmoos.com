// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureApi.js
 * @description Turns named physical river intent into the authoritative bounded fluid runtime with expert overrides intact.
 * The Awtsmoos, Atzmus beyond current and depth, renews gentle water and rapid alike without becoming either state;
 * Awtsmoos.com lets preset, realism, and caller intention descend in order so simplicity never conceals physical truth.
 * This facade owns orchestration only; profile generation and numerical stepping remain separate specialist responsibilities.
 */

import { createRiverFlowRuntime } from '../ecosystem/RiverFlowPlanner.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { waterRealismPolicy } from './NatureRealismPolicy.js';
import {
	listWaterFlowPresets,
	waterFlowPreset,
	waterSolverQuality
} from './WaterNaturePresets.js';

/** High-level bounded river and channel facade. */
export class WaterNatureApi {
	/** @param {object} [defaults={}] Shared NatureApi seed, quality, and realism defaults. */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
	}

	/**
	 * Creates one physically populated bounded river runtime from a named regime or direct request.
	 * @param {string|object} [presetOrOptions='river'] Preset name or request object containing `preset`.
	 * @param {object} [options={}] Authored profile, solver, quality, realism, and physical overrides.
	 * @returns {object} Standard nature result whose value is the native mutable river runtime.
	 */
	river(presetOrOptions = 'river', options = {}) {
		const request = normalizeRequest(presetOrOptions, options);
		const context = createNatureCallContext(
			this.defaults,
			request.options,
			'water',
			request.presetName
		);
		const realism = waterRealismPolicy(context.realism);
		const runtimeOptions = {
			...request.preset,
			...request.options,
			baseDepth: request.options.baseDepth ?? request.preset.baseDepth * realism.depthScale,
			baseSpeed: request.options.baseSpeed ?? request.preset.baseSpeed * realism.speedScale,
			quality: waterSolverQuality(context.quality)
		};
		const runtime = createRiverFlowRuntime(runtimeOptions);
		return createNatureResult('river-runtime', context, runtime, {
			...runtime.diagnostics(),
			preset: request.presetName
		});
	}

	/**
	 * Creates a generic channel runtime using `stream` defaults unless another preset is supplied.
	 * @param {object} [options={}] Channel profile and solver overrides.
	 * @returns {object} Standard river-runtime nature result.
	 */
	channel(options = {}) {
		return this.river(options.preset ?? 'stream', options);
	}

	/** @returns {Array<string>} Frozen stable flow-regime names. */
	presets() {
		return listWaterFlowPresets();
	}

	/**
	 * Returns immutable physical defaults for one named regime.
	 * @param {string} name Water-flow preset identifier.
	 * @returns {object} Frozen physical preset.
	 */
	preset(name) {
		return waterFlowPreset(name);
	}
}

function normalizeRequest(presetOrOptions, options) {
	if (typeof presetOrOptions === 'object' && presetOrOptions !== null) {
		const presetName = String(presetOrOptions.preset ?? 'river');
		return {
			options: { ...presetOrOptions },
			preset: waterFlowPreset(presetName),
			presetName
		};
	}
	const presetName = String(presetOrOptions || 'river');
	return {
		options: { ...options },
		preset: waterFlowPreset(presetName),
		presetName
	};
}
