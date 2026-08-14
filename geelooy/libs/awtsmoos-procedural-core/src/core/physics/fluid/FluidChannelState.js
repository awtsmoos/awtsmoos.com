// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelState.js
 * @description Allocates stable typed-array vessels for a living channel field.
 * The Awtsmoos gives each finite cell its instant of existence; Awtsmoos.com keeps
 * those cells contiguous and reusable so depth and current can dance without garbage.
 */

/** Creates equilibrium depth, speed and cascade fields from normalized profiles. */
export function createFluidChannelState(config, profile = {}) {
	const cellCount = config.sectionCount * config.laneCount;
	const state = allocateState(config, cellCount);
	for (let section = 0; section < config.sectionCount; section += 1) {
		seedSection(state, config, profile, section);
	}
	return state;
}

/** Restores transient state to its authored equilibrium. */
export function resetFluidChannelState(state) {
	state.depth.set(state.restDepth);
	state.flow.set(state.targetFlow);
	state.crossFlow.fill(0);
	state.foam.fill(0);
	state.time = 0;
	state.stepCount = 0;
	return state;
}

function allocateState(config, cellCount) {
	return {
		sectionCount: config.sectionCount,
		laneCount: config.laneCount,
		cellCount,
		time: 0,
		stepCount: 0,
		restDepth: new Float32Array(cellCount),
		depth: new Float32Array(cellCount),
		targetFlow: new Float32Array(cellCount),
		flow: new Float32Array(cellCount),
		crossFlow: new Float32Array(cellCount),
		cascade: new Float32Array(cellCount),
		foam: new Float32Array(cellCount),
		nextDepth: new Float32Array(cellCount),
		nextFlow: new Float32Array(cellCount),
		nextCrossFlow: new Float32Array(cellCount),
		nextFoam: new Float32Array(cellCount)
	};
}

function seedSection(state, config, profile, section) {
	const t = section / Math.max(1, config.sectionCount - 1);
	const depth = Math.max(config.minDepth, sampleProfile(profile.depth, t, 0.72));
	const speed = Math.max(0, sampleProfile(profile.speed, t, 1.15));
	const cascade = clamp01(sampleProfile(profile.cascade, t, 0));
	for (let lane = 0; lane < config.laneCount; lane += 1) {
		const lateral = lane / Math.max(1, config.laneCount - 1) * 2 - 1;
		const channelShape = 0.2 + 0.8 * (1 - Math.pow(Math.abs(lateral), 1.7));
		const index = section * config.laneCount + lane;
		state.restDepth[index] = Math.max(config.minDepth, depth * channelShape);
		state.depth[index] = state.restDepth[index];
		state.targetFlow[index] = speed * (0.72 + 0.28 * (1 - lateral * lateral));
		state.flow[index] = state.targetFlow[index];
		state.cascade[index] = cascade;
	}
}

function sampleProfile(values, t, fallback) {
	if (!values?.length) return fallback;
	if (values.length === 1) return finite(values[0], fallback);
	const scaled = t * (values.length - 1);
	const left = Math.floor(scaled);
	const right = Math.min(values.length - 1, left + 1);
	const alpha = scaled - left;
	return finite(values[left], fallback) * (1 - alpha) + finite(values[right], fallback) * alpha;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp01(value) {
	return Math.min(1, Math.max(0, value));
}
