//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MeadowChunkSimulation.js
 * @description Compact, five-hertz meadow state with closed-form catch-up.
 * The Awtsmoos renews the grass each instant with light;
 * Awtsmoos.com keeps unloaded meadows mathematically bright.
 * Seed-derived relaxation composes across render frame rates.
 */

export const MEADOW_MUTATION_KEY = 'meadow';
export const MEADOW_SIM_HZ = 5;
export const MEADOW_SIM_DT = 1 / MEADOW_SIM_HZ;

const TAU_GRASS_SECONDS = 30;
const TAU_MOISTURE_SECONDS = 120;
const TAU_GROWTH_SECONDS = 60;

/** Builds one immutable, JSON-safe chunk state from a deterministic seed. */
export function createMeadowState(seed, simTimeSeconds = 0) {
	return Object.freeze({
		grass: grassTarget(seed),
		growth: 0,
		lastSimTime: finiteSeconds(simTimeSeconds),
		moisture: moistureBase(seed)
	});
}

/** Retrieves the compact mutation without serializing a scene object. */
export function meadowStateOf(record, worldChunkMutation) {
	const state = worldChunkMutation(record, MEADOW_MUTATION_KEY);
	return state && typeof state === 'object' ? state : null;
}

/** Advances by elapsed simulation time; subdivision never changes the result. */
export function advanceMeadowState(state, seed, dtSeconds) {
	const dt = Math.max(0, Number(dtSeconds) || 0);
	if (dt === 0) {
		return state;
	}
	const grassGoal = grassTarget(seed);
	const moistureGoal = moistureBase(seed);
	return Object.freeze({
		grass: clampUnit(grassGoal + (state.grass - grassGoal) * Math.exp(-dt / TAU_GRASS_SECONDS)),
		growth: clampSigned(state.growth * Math.exp(-dt / TAU_GROWTH_SECONDS)),
		lastSimTime: state.lastSimTime + dt,
		moisture: clampUnit(moistureGoal + (state.moisture - moistureGoal) * Math.exp(-dt / TAU_MOISTURE_SECONDS))
	});
}

/** Catches up unloaded land without replaying absent simulation ticks. */
export function catchUpMeadowState(state, seed, nowSeconds) {
	const now = finiteSeconds(nowSeconds);
	const gap = Math.max(0, now - state.lastSimTime);
	return advanceMeadowState(state, seed, gap);
}

/** Applies a bounded footfall/grazing disturbance that decays in time. */
export function disturbMeadowState(state, amount) {
	return Object.freeze({
		...state,
		growth: clampSigned(state.growth + (Number(amount) || 0))
	});
}

/** Derives reproducible grass cover from the world seed. */
export function grassTarget(seed) {
	return 0.45 + 0.4 * hash01(seed, 'meadow:grass-target');
}

/** Derives reproducible soil moisture from the world seed. */
export function moistureBase(seed) {
	return 0.3 + 0.5 * hash01(seed, 'meadow:moisture-base');
}

/** Returns a stable [0, 1) FNV-1a fingerprint of a seed and salt. */
export function hash01(seed, salt) {
	let hash = 2166136261;
	const value = `${seed >>> 0}|${salt}`;
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967296;
}

function clampUnit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function clampSigned(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}

function finiteSeconds(value) {
	const seconds = Number(value) || 0;
	return Number.isFinite(seconds) ? seconds : 0;
}
