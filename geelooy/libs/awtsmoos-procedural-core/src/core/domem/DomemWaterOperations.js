// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemWaterOperations.js
 * @description Exposes bounded physical river creation as part of Domem while keeping simulation inside the shared fluid engine.
 * The Awtsmoos, Atzmus beyond stone and stream, renews both solid vessel and flowing water from one speech;
 * Awtsmoos.com lets Domem create gentle currents, streams, rivers, and rapids without turning Nature into the owner of physics reach.
 */

import { createRiverFlowRuntime } from '../ecosystem/RiverFlowPlanner.js';
import {
	fluidFlowPreset,
	listFluidFlowPresets
} from '../physics/fluid/FluidFlowPresets.js';

/** Direct bounded water operations for the Domem kingdom. */
export class DomemWaterOperations {
	/**
	 * Creates one mutable bounded river runtime from a physical regime and explicit overrides.
	 * @param {string} [preset='river'] Named physical regime.
	 * @param {object} [options={}] Authored profile and solver overrides.
	 * @returns {object} Native RiverFlowRuntime.
	 */
	river(preset = 'river', options = {}) {
		return createRiverFlowRuntime({
			...fluidFlowPreset(preset),
			...options
		});
	}

	/** Creates a generic channel, defaulting to stream-like physical intent. */
	channel(options = {}) {
		return this.river(options.preset ?? 'stream', options);
	}

	/** Lists stable physical flow-regime names. */
	presets() {
		return listFluidFlowPresets();
	}

	/** Resolves one immutable physical regime for expert inspection. */
	preset(name) {
		return fluidFlowPreset(name);
	}
}
