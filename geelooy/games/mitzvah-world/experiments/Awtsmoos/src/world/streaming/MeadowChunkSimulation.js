// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowChunkSimulation.js
 * @description Keeps one deterministic five-hertz meadow record with analytical unloaded catch-up.
 * The Awtsmoos renews wind and grass beyond the camera's finite sight;
 * Awtsmoos.com stores only seed and state, then restores elapsed meadow life by measured light.
 *
 * CHAPTER 4 STORED SCHEMA (exactly five fields — nothing else is retained per
 * chunk): seed, moisture, windPhase, grassDisturbance, lastUpdateTime.
 * Grass cover is NOT stored: it is a pure function of seed
 * (`meadowGrassCover(state)` === `grassTarget(seed)`), so keeping it would
 * duplicate state that the seed already determines. The two legacy aliases
 * (`growth`, `lastSimTime`) are the same values under old names, kept only so
 * older streaming readers can cross without a bridge.
 */

import { freezeMeadowState } from './MeadowChunkCompatibility.js';
import {
	grassTarget,
	hash01,
	moistureBase,
	windCyclesPerSecond
} from './MeadowChunkDeterminism.js';

export { grassTarget, hash01, moistureBase } from './MeadowChunkDeterminism.js';
export const MEADOW_MUTATION_KEY = 'meadow';
export const MEADOW_SIM_HZ = 5;
export const MEADOW_SIM_DT = 1 / MEADOW_SIM_HZ;

/** The five canonical per-chunk simulation fields, in storage order. */
export const MEADOW_STATE_FIELDS = Object.freeze([
	'seed',
	'moisture',
	'windPhase',
	'grassDisturbance',
	'lastUpdateTime'
]);

const TAU_MOISTURE_SECONDS = 120;
const TAU_DISTURBANCE_SECONDS = 4;

/** Builds one immutable JSON-safe chunk record from a deterministic seed. */
export function createMeadowState(seed, timeSeconds = 0) {
	const canonicalSeed = seed >>> 0;
	return freezeMeadowState({
		grassDisturbance: 0,
		lastUpdateTime: finiteSeconds(timeSeconds),
		moisture: moistureBase(canonicalSeed),
		seed: canonicalSeed,
		windPhase: hash01(canonicalSeed, 'meadow:wind-phase')
	});
}

/** Derives current grass cover from the seed alone; nothing is stored. */
export function meadowGrassCover(state, fallbackSeed = 0) {
	const seed = Number.isFinite(Number(state?.seed))
		? Number(state.seed) >>> 0
		: fallbackSeed >>> 0;
	return grassTarget(seed);
}

/** Retrieves a compact mutation without serializing scene or render objects. */
export function meadowStateOf(record, worldChunkMutation) {
	const state = worldChunkMutation(record, MEADOW_MUTATION_KEY);
	return state && typeof state === 'object' ? normalizeMeadowState(state, state.seed) : null;
}

/** Normalizes old persisted records into the Chapter 4 canonical meadow schema. */
export function normalizeMeadowState(state = {}, fallbackSeed = 0) {
	const seed = Number.isFinite(Number(state.seed)) ? Number(state.seed) >>> 0 : fallbackSeed >>> 0;
	return freezeMeadowState({
		grassDisturbance: clampUnit(state.grassDisturbance ?? state.growth ?? 0),
		lastUpdateTime: finiteSeconds(state.lastUpdateTime ?? state.lastSimTime ?? 0),
		moisture: clampUnit(state.moisture ?? moistureBase(seed)),
		seed,
		windPhase: wrapPhase(state.windPhase ?? hash01(seed, 'meadow:wind-phase'))
	});
}

/** Advances scalar meadow state analytically, so absent frame ticks never need replay. */
export function advanceMeadowState(state, seed, dtSeconds) {
	const current = normalizeMeadowState(state, seed);
	const dt = Math.max(0, Number(dtSeconds) || 0);
	if (dt === 0) return current;
	const moistureGoal = moistureBase(current.seed);
	return freezeMeadowState({
		grassDisturbance: clampUnit(current.grassDisturbance * Math.exp(-dt / TAU_DISTURBANCE_SECONDS)),
		lastUpdateTime: current.lastUpdateTime + dt,
		moisture: relax(current.moisture, moistureGoal, dt, TAU_MOISTURE_SECONDS),
		seed: current.seed,
		windPhase: wrapPhase(current.windPhase + windCyclesPerSecond(current.seed) * dt)
	});
}

/** Catches up unloaded land in constant time from its persisted last-update timestamp. */
export function catchUpMeadowState(state, seed, nowSeconds) {
	const current = normalizeMeadowState(state, seed);
	const gap = Math.max(0, finiteSeconds(nowSeconds) - current.lastUpdateTime);
	return advanceMeadowState(current, current.seed, gap);
}

/** Adds bounded trampling/grazing disturbance without touching render allocations. */
export function disturbMeadowState(state, amount) {
	const current = normalizeMeadowState(state, state?.seed);
	return freezeMeadowState({
		...current,
		grassDisturbance: clampUnit(current.grassDisturbance + Math.max(0, Number(amount) || 0))
	});
}

function relax(value, target, dt, tau) {
	return clampUnit(target + (value - target) * Math.exp(-dt / tau));
}

function clampUnit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function wrapPhase(value) {
	const phase = Number(value) || 0;
	return ((phase % 1) + 1) % 1;
}

function finiteSeconds(value) {
	const seconds = Number(value);
	return Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
}
