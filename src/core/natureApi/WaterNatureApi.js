// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureApi.js
 * @description Exposes bounded water motion, immutable river reaches, and deterministic water basins through one small public facade.
 * The Awtsmoos, Atzmus beyond current and shore, renews moving and resting water without confusing their finite vessels;
 * Awtsmoos.com keeps this doorway simple while specialist operation modules preserve the separate laws beneath their levels.
 */

import {
	createWaterBasinNatureResult,
	createWaterReachNatureResult,
	createWaterRuntimeNatureResult
} from './WaterNatureOperations.js';
import {
	listWaterFlowPresets,
	waterFlowPreset
} from './WaterNaturePresets.js';
import { normalizeWaterNatureRequest } from './WaterNatureRequest.js';

/** High-level bounded river, channel, reach, and basin facade. */
export class WaterNatureApi {
	/** @param {object} [defaults={}] Shared NatureApi seed, quality, and realism defaults. */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
	}

	/** Creates one physically populated bounded river runtime. */
	river(presetOrOptions = 'river', options = {}) {
		const request = normalizeWaterNatureRequest(presetOrOptions, options);
		return createWaterRuntimeNatureResult(this.defaults, request);
	}

	/** Creates one immutable renderer-neutral river reach plan. */
	reach(presetOrOptions = 'river', options = {}) {
		const request = normalizeWaterNatureRequest(presetOrOptions, options);
		return createWaterReachNatureResult(this.defaults, request);
	}

	/** Creates one immutable pond, lake, or wetland spatial plan. */
	basin(kind = 'pond', options = {}) {
		return createWaterBasinNatureResult(this.defaults, kind, options);
	}

	/** Creates a generic channel runtime using stream defaults unless another preset is supplied. */
	channel(options = {}) {
		return this.river(options.preset ?? 'stream', options);
	}

	/** @returns {Array<string>} Frozen stable flow-regime names. */
	presets() {
		return listWaterFlowPresets();
	}

	/** Returns immutable physical defaults for one named flow regime. */
	preset(name) {
		return waterFlowPreset(name);
	}
}
