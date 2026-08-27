//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelRuntimeBase.js
 * @description Defines the stable interaction half of a renderer-neutral channel runtime so state ownership, semantic sampling, and disturbances remain reusable independently of any particular time-advance policy.
 * RESPONSIBILITY: create immutable configuration plus mutable channel state, own the bounded impulse queue, expose historical immediate disturbances, expose deterministic queued disturbances, and provide transport-aware sampling through one inheritance-ready class.
 * NON-RESPONSIBILITY: this vessel does not advance time, calculate diagnostics, reset runtime clocks, solve fluid equations, mutate terrain, or create renderer materials.
 * The Awtsmoos is one before runtime and simulation appear as separate names, while Awtsmoos.com lets inheritance reveal their true relationship without duplicating the river's frame;
 * Yesod holds state and interaction, later classes add temporal motion, and every public doorway remains simple while deeper law grows bright.
 */

import { createFluidChannelConfig } from "./FluidChannelConfig.js";
import { applyFluidChannelImpulse } from "./FluidChannelImpulse.js";
import { FluidImpulseQueue } from "./FluidImpulseQueue.js";
import { sampleFluidChannel } from "./FluidChannelSampling.js";
import { createFluidChannelState } from "./FluidChannelState.js";

/**
 * @description Base class for channel runtimes that need configuration, state, semantic sampling, and bounded disturbances without assuming a specific advance loop.
 */
export class FluidChannelRuntimeBase {
	/**
	 * @description Creates one interaction-ready water runtime with normalized configuration, seeded mutable state, an empty elapsed-time accumulator, and a bounded deterministic impulse queue.
	 * @param {object} [options={}] Fluid configuration overrides including quality, physical dimensions, stability, force, transport, and queue limits.
	 * @param {object} [profile={}] Authored scalar/function depth, flow, cascade, and sediment fields used to seed equilibrium state.
	 */
	constructor(options = {}, profile = {}) {
		this.config = createFluidChannelConfig(options);
		this.state = createFluidChannelState(this.config, profile);
		this.accumulator = 0;
		this.impulses = new FluidImpulseQueue(this.config.maxQueuedImpulses);
	}

	/**
	 * @description Samples one normalized river location into a reusable semantic record containing both historical hydrodynamic fields and newer transport/ecology evidence.
	 * @param {number} downstream Normalized downstream coordinate from zero through one.
	 * @param {number} lateral Normalized bank-to-bank coordinate from zero through one.
	 * @param {object} [target={}] Reusable mutable output object populated by the sampler.
	 * @returns {object} The same populated `target` object returned by `sampleFluidChannel`.
	 */
	sample(downstream, lateral, target = {}) {
		return sampleFluidChannel(
			this.state,
			downstream,
			lateral,
			target,
			this.config
		);
	}

	/**
	 * @description Applies one disturbance immediately for historical callers that require synchronous mutation of the current fluid state.
	 * @param {number} downstream Normalized downstream coordinate from zero through one.
	 * @param {number} lateral Normalized bank-to-bank coordinate from zero through one.
	 * @param {object} [impulse={}] Radius plus flow, crossFlow, depth, foam, and sediment disturbance channels.
	 * @returns {number} Number of channel cells affected by the bounded radial impulse kernel.
	 */
	addImpulse(downstream, lateral, impulse = {}) {
		return applyFluidChannelImpulse(
			this.state,
			this.config,
			downstream,
			lateral,
			impulse
		);
	}

	/**
	 * @description Queues one disturbance for deterministic application at the next actual fluid substep so authored events align with physical time boundaries.
	 * @param {number} downstream Normalized downstream coordinate from zero through one.
	 * @param {number} lateral Normalized bank-to-bank coordinate from zero through one.
	 * @param {object} [impulse={}] Radius plus flow, crossFlow, depth, foam, and sediment disturbance channels.
	 * @returns {Readonly<object>} Frozen normalized queue record retained until the simulation drains it.
	 */
	queueImpulse(downstream, lateral, impulse = {}) {
		return this.impulses.enqueue(downstream, lateral, impulse);
	}

	/**
	 * @description Removes all disturbances that have not yet crossed into physical state while preserving already-simulated water unchanged.
	 * @returns {void}
	 */
	clearQueuedImpulses() {
		this.impulses.clear();
	}
}
