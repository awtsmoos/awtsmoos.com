// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowChunkSimulation.js
 * @description Owns one compact meadow state per streamed chunk with closed-form dynamics.
 * The Awtsmoos lets grass, moisture, and growth answer time through pure mathematics;
 * Awtsmoos.com advances active chunks at a low fixed rate and catches up unloaded
 * chunks by formula on revisit, so absence never costs a single stepped instant.
 *
 * State shape (JSON-safe, stored via durableMutations under MEADOW_MUTATION_KEY):
 *   { grass: 0..1, moisture: 0..1, growth: -1..1, lastSimTime: seconds }
 *
 * Dynamics are linear-exponential relaxations toward seed-derived targets, so
 * advancing N small steps composes exactly to one advance of the full span.
 */

export const MEADOW_MUTATION_KEY = 'meadow';
export const MEADOW_SIM_HZ = 2;
export const MEADOW_SIM_DT = 1 / MEADOW_SIM_HZ;

const TAU_GRASS_SECONDS = 30;
const TAU_MOISTURE_SECONDS = 120;
const TAU_GROWTH_SECONDS = 60;

/** Creates the initial meadow state for a chunk seed at the given sim time. */
export function createMeadowState(seed, simTimeSeconds = 0) {
	return Object.freeze({
		grass: grassTarget(seed),
		growth: 0,
		lastSimTime: finiteSeconds(simTimeSeconds),
		moisture: moistureBase(seed)
	});
}

/** Reads the meadow state from a chunk record, or null when never simulated. */
export function meadowStateOf(record, worldChunkMutation) {
	const state = worldChunkMutation(record, MEADOW_MUTATION_KEY);
	return state && typeof state === 'object' ? state : null;
}

/**
 * Advances one meadow state by dtSeconds in closed form.
 * Identical for any subdivision of dtSeconds: advance(a+b) == advance(a)+advance(b).
 */
export function advanceMeadowState(state, seed, dtSeconds) {
	const dt = Math.max(0, Number(dtSeconds) || 0);
	if (dt === 0) return state;
	const grassT = grassTarget(seed);
	const moistureB = moistureBase(seed);
	return Object.freeze({
		grass: clampUnit(grassT + (state.grass - grassT) * Math.exp(-dt / TAU_GRASS_SECONDS)),
		growth: clampSigned(state.growth * Math.exp(-dt / TAU_GROWTH_SECONDS)),
		lastSimTime: state.lastSimTime + dt,
		moisture: clampUnit(moistureB + (state.moisture - moistureB) * Math.exp(-dt / TAU_MOISTURE_SECONDS))
	});
}

/**
 * Catches an unloaded chunk up to nowSeconds by pure mathematics.
 * No stepping: the closed form over the whole gap equals continuous simulation.
 */
export function catchUpMeadowState(state, seed, nowSeconds) {
	const now = finiteSeconds(nowSeconds);
	const gap = Math.max(0, now - state.lastSimTime);
	return advanceMeadowState(state, seed, gap);
}

/** Applies one disturbance impulse (trampling, grazing) to growth, bounded to [-1, 1]. */
export function disturbMeadowState(state, amount) {
	return Object.freeze({
		...state,
		growth: clampSigned(state.growth + (Number(amount) || 0))
	});
}

/** Deterministic seed-derived grass target in [0.45, 0.85]. */
export function grassTarget(seed) {
	return 0.45 + 0.4 * hash01(seed, 'meadow:grass-target');
}

/** Deterministic seed-derived moisture baseline in [0.3, 0.8]. */
export function moistureBase(seed) {
	return 0.3 + 0.5 * hash01(seed, 'meadow:moisture-base');
}

/** Stable [0,1) hash of seed and salt via FNV-1a. */
export function hash01(seed, salt) {
	let hash = 2166136261;
	const text = `${seed >>> 0}|${salt}`;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
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
