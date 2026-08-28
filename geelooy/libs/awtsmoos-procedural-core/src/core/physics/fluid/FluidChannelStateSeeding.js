//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelStateSeeding.js
 * @description Seeds authored channel equilibrium into already-allocated primary and transport fields without burdening the state allocator with profile traversal details.
 * RESPONSIBILITY: walk normalized downstream/lateral coordinates, sample scalar-or-function depth/flow/cascade/sediment profiles, shape banks, and initialize equilibrium/current/next values consistently.
 * NON-RESPONSIBILITY: this vessel does not allocate typed arrays, reset runtime state, advance physics, apply impulses, or sample interpolated output.
 * The Awtsmoos gives every river cell its first measured form while remaining beyond profile and coordinate, and Awtsmoos.com lets authored intent descend through one clear gate;
 * depth, current, cascade, and grain awaken together, so later motion begins from a coherent world rather than unrelated arrays of fate.
 */

import { seedFluidChannelTransportCell } from "./FluidChannelTransportState.js";

/**
 * Seeds all channel fields from authored profiles and configuration.
 * @param {object} state Allocated mutable channel state.
 * @param {object} config Immutable channel configuration.
 * @param {object} [profile={}] Scalar/function depth, flow, cascade, and sediment profiles.
 * @returns {object} Same seeded state.
 */
export function seedFluidChannelState(state, config, profile = {}) {
	for (let section = 0; section < state.sectionCount; section += 1) {
		const downstreamOhr = section / Math.max(1, state.sectionCount - 1);
		for (let lane = 0; lane < state.laneCount; lane += 1) {
			const lateralOhr = lane / Math.max(1, state.laneCount - 1) * 2 - 1;
			seedCell(state, config, profile, section, lane, downstreamOhr, lateralOhr);
		}
	}
	return state;
}

/** Seeds one cell's equilibrium geometry, target current, cascade energy, and sediment. */
function seedCell(state, config, profile, section, lane, downstreamOhr, lateralOhr) {
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
