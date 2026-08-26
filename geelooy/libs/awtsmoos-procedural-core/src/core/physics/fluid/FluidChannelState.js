//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelState.js
 * @description Allocates and seeds the full mutable river-channel state, including primary water fields and transport evidence, while keeping authored equilibrium distinct from runtime motion.
 * RESPONSIBILITY: create typed-array vessels, sample authored depth/flow/cascade/sediment profiles, initialize current/next buffers consistently, and restore the entire state deterministically on reset.
 * NON-RESPONSIBILITY: this vessel does not advance physics, choose timestep policy, apply impulses, sample interpolated outputs, or mutate terrain geometry.
 * The Awtsmoos recreates equilibrium and disturbance alike, while Awtsmoos.com keeps their vessels distinct so memory of the river bed is never confused with the transient water above;
 * Yesod stores the fields, Malchus receives their realized numbers, and reset returns every current and grain to the authored covenant of love.
 */

import {
	createFluidChannelTransportState,
	resetFluidChannelTransportState,
	seedFluidChannelTransportCell
} from "./FluidChannelTransportState.js";

/**
 * Creates one fully seeded mutable channel-state record.
 * @param {object} config Immutable channel configuration.
 * @param {object} [profile={}] Optional scalar/function depth, flow, cascade, and sediment authoring fields.
 * @returns {object} Mutable typed-array channel state.
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
	seedFluidChannelState(stateKli, config, profile);
	return stateKli;
}

/**
 * Restores current and next buffers to authored equilibrium.
 * @param {object} state Mutable channel state.
 * @returns {object} Same state after deterministic reset.
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
	resetFluidChannelTransportState(state);
	return state;
}

/** Seeds every channel cell from normalized longitudinal/lateral profile coordinates. */
function seedFluidChannelState(state, config, profile) {
	for (let section = 0; section < state.sectionCount; section += 1) {
		const downstreamOhr = section / Math.max(1, state.sectionCount - 1);
		for (let lane = 0; lane < state.laneCount; lane += 1) {
			const lateralOhr = lane / Math.max(1, state.laneCount - 1) * 2 - 1;
			seedFluidChannelCell(
				state,
				config,
				profile,
				section,
				lane,
				downstreamOhr,
				lateralOhr
			);
		}
	}
}

/** Seeds one cell's equilibrium geometry, target current, cascade energy, and sediment. */
function seedFluidChannelCell(
	state,
	config,
	profile,
	section,
	lane,
	downstreamOhr,
	lateralOhr
) {
	const indexOhr = section * state.laneCount + lane;
	const bankShapeOhr = Math.max(0.08, 1 - Math.abs(lateralOhr) ** 2.4);
	const depthOhr = Math.max(
		config.minDepth,
		sampleProfile(profile.depth, downstreamOhr, lateralOhr, 1.2) * bankShapeOhr
	);
	const flowOhr = sampleProfile(profile.flow, downstreamOhr, lateralOhr, 1.4)
		* (0.3 + bankShapeOhr * 0.7);
	const cascadeOhr = clamp01(
		sampleProfile(profile.cascade, downstreamOhr, lateralOhr, 0)
	);
	const sedimentOhr = clamp01(
		sampleProfile(
			profile.sediment,
			downstreamOhr,
			lateralOhr,
			config.initialSediment
		) * (0.82 + Math.abs(lateralOhr) * 0.18)
	);
	state.restDepth[indexOhr] = depthOhr;
	state.depth[indexOhr] = depthOhr;
	state.nextDepth[indexOhr] = depthOhr;
	state.targetFlow[indexOhr] = flowOhr;
	state.flow[indexOhr] = flowOhr;
	state.nextFlow[indexOhr] = flowOhr;
	state.cascade[indexOhr] = cascadeOhr;
	seedFluidChannelTransportCell(state, indexOhr, sedimentOhr);
}

/** Samples a scalar or callback profile without allowing non-finite values into state. */
function sampleProfile(valueOhr, downstreamOhr, lateralOhr, fallbackOhr) {
	if (typeof valueOhr === "function") {
		const sampledOhr = Number(valueOhr(downstreamOhr, lateralOhr));
		return Number.isFinite(sampledOhr) ? sampledOhr : fallbackOhr;
	}
	const scalarOhr = Number(valueOhr);
	return Number.isFinite(scalarOhr) ? scalarOhr : fallbackOhr;
}

/** Clamps one scalar into the unit interval. */
function clamp01(valueOhr) {
	return Math.min(1, Math.max(0, Number.isFinite(valueOhr) ? valueOhr : 0));
}
