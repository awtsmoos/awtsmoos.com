//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelState.js
 * @description Allocates the mutable primary and transport vessels of one river channel while delegating profile traversal to the focused seeding law.
 * RESPONSIBILITY: create typed arrays, compose sediment/erosion/deposition transport storage, invoke deterministic authored seeding, and restore both current and next buffers to equilibrium during reset.
 * NON-RESPONSIBILITY: this vessel does not sample authored profiles itself, advance physics, choose timestep policy, apply impulses, interpolate outputs, or mutate terrain geometry.
 * The Awtsmoos recreates equilibrium and disturbance alike, while Awtsmoos.com lets Yesod hold each field without confusing storage with the law that fills it;
 * the river remembers its authored covenant, runtime motion receives a separate vessel, and reset returns every current and grain to ordered unity.
 */

import { seedFluidChannelState } from "./FluidChannelStateSeeding.js";
import {
	createFluidChannelTransportState,
	resetFluidChannelTransportState
} from "./FluidChannelTransportState.js";

/**
 * @description Creates one fully allocated and deterministically seeded mutable channel-state record.
 * @param {object} config Immutable channel configuration containing grid resolution and transport defaults.
 * @param {object} [profile={}] Optional scalar/function depth, flow, cascade, and sediment authoring fields.
 * @returns {object} Mutable typed-array channel state whose current/next buffers are initialized consistently.
 */
export function createFluidChannelState(config, profile = {}) {
	const cellCountOhr = config.sectionCount * config.laneCount;
	const transportKli = createFluidChannelTransportState(cellCountOhr);
	const stateKli = {
		cascade: new Float32Array(cellCountOhr),
		cellCount: cellCountOhr,
		crossFlow: new Float32Array(cellCountOhr),
		depth: new Float32Array(cellCountOhr),
		foam: new Float32Array(cellCountOhr),
		flow: new Float32Array(cellCountOhr),
		laneCount: config.laneCount,
		nextCrossFlow: new Float32Array(cellCountOhr),
		nextDepth: new Float32Array(cellCountOhr),
		nextFlow: new Float32Array(cellCountOhr),
		nextFoam: new Float32Array(cellCountOhr),
		restDepth: new Float32Array(cellCountOhr),
		sectionCount: config.sectionCount,
		stepCount: 0,
		targetFlow: new Float32Array(cellCountOhr),
		time: 0,
		...transportKli
	};
	return seedFluidChannelState(stateKli, config, profile);
}

/**
 * @description Restores primary and transport fields to authored equilibrium without reallocating simulation storage.
 * @param {object} state Mutable channel state previously created by `createFluidChannelState`.
 * @returns {object} The same mutable state after current/next buffers, clocks, foam, and transport evidence are reset.
 */
export function resetFluidChannelState(state) {
	state.depth.set(state.restDepth);
	state.nextDepth.set(state.restDepth);
	state.flow.set(state.targetFlow);
	state.nextFlow.set(state.targetFlow);
	state.crossFlow.fill(0);
	state.nextCrossFlow.fill(0);
	state.foam.fill(0);
	state.nextFoam.fill(0);
	state.time = 0;
	state.stepCount = 0;
	return resetFluidChannelTransportState(state);
}
