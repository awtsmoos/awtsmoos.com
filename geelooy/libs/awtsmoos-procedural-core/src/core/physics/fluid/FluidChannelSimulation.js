//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelSimulation.js
 * @description Extends the reusable interaction runtime with bounded physical time evolution, diagnostics, deterministic reset, and queued-disturbance drainage while preserving the historical `FluidChannelSimulation` public class.
 * RESPONSIBILITY: delegate elapsed-time stepping to the adaptive channel advance policy, expose numerical diagnostics, restore authored equilibrium, and apply queued impulses exactly at simulation boundaries through inherited state/configuration.
 * NON-RESPONSIBILITY: this vessel does not recreate configuration/state allocation, semantic sampling, public immediate/queued impulse APIs, fluid force equations, interpolation math, terrain erosion geometry, or renderer effects.
 * The Awtsmoos is one before base and extension appear, while Awtsmoos.com lets inheritance reveal their measured order without repeating a single river law;
 * interaction rests in Yesod, time descends through Netzach, diagnostics reveal Hod, and the familiar public name remains a simple doorway through it all.
 */

import { advanceFluidChannelOwner } from "./FluidChannelAdvancePolicy.js";
import { fluidChannelDiagnostics } from "./FluidChannelDiagnostics.js";
import { applyFluidChannelImpulse } from "./FluidChannelImpulse.js";
import { FluidChannelRuntimeBase } from "./FluidChannelRuntimeBase.js";
import { resetFluidChannelState } from "./FluidChannelState.js";

/**
 * @description Public renderer-neutral channel simulation whose inherited API owns state/sampling/disturbances while this subclass owns time evolution, diagnostics, and reset lifecycle.
 */
export class FluidChannelSimulation extends FluidChannelRuntimeBase {
	/**
	 * @description Advances external elapsed time through CFL-safe, quality-bounded physical substeps while queued impulses enter state only at actual substep boundaries.
	 * @param {number} deltaSeconds External elapsed time in seconds; negative/non-finite values are safely normalized by the advance policy.
	 * @returns {number} Number of completed fluid substeps during this call.
	 */
	advance(deltaSeconds) {
		return advanceFluidChannelOwner(this, deltaSeconds);
	}

	/**
	 * @description Collects primary flow, transport, queue, erosion/deposition, and stability evidence without exposing mutable simulation arrays.
	 * @param {object} [target={}] Reusable mutable diagnostics object populated in place to avoid mandatory allocation in repeated editor/runtime inspection.
	 * @returns {object} The same populated `target` containing depth/speed/foam/sediment/exchange/queue/time/step/safe-step evidence.
	 */
	getStats(target = {}) {
		return fluidChannelDiagnostics(
			this.state,
			this.config,
			this.impulses,
			target
		);
	}

	/**
	 * @description Restores authored water/transport equilibrium and clears elapsed-time remainder plus all disturbances that have not yet entered physical state.
	 * @returns {object} The same mutable channel state after deterministic reset; typed-array storage is reused rather than reallocated.
	 */
	reset() {
		this.accumulator = 0;
		this.impulses.clear();
		return resetFluidChannelState(this.state);
	}

	/**
	 * @description Applies every queued disturbance exactly once using the shared immediate impulse kernel, preserving one physical law for synchronous and timestep-aligned interactions.
	 * @returns {number} Number of queued disturbance records consumed from the bounded FIFO queue.
	 */
	drainQueuedImpulses() {
		const applyOhr = this.applyQueuedImpulse.bind(this);
		return this.impulses.drain(applyOhr);
	}

	/**
	 * @description Applies one normalized queued disturbance record to inherited mutable state through the shared radial impulse kernel.
	 * @param {object} recordKli Frozen queue record containing normalized `downstream`, `lateral`, and `impulse` fields.
	 * @returns {number} Number of channel cells affected by the queued disturbance.
	 */
	applyQueuedImpulse(recordKli) {
		return applyFluidChannelImpulse(
			this.state,
			this.config,
			recordKli.downstream,
			recordKli.lateral,
			recordKli.impulse
		);
	}
}
