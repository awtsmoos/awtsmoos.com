// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldWindState.js
 * @description THE shared wind state for Mitzvah World (Chapter 4, Task 3).
 * One small named object — seed plus wind phase — that every wind reader shares.
 *
 * TASK 4 (GRASS SYSTEM): import this file. Read `windState.windPhase` (cycles
 * in [0, 1)) each frame, or call `mitzvahWorldWindSwayAt(windState, x, z, time)`
 * for a per-position blade-sway vector. Do NOT invent a second wind phase or a
 * second wind clock: the meadow simulation in MeadowChunkSimulation.js advances
 * per-chunk wind phase with the same law (same salt, same cycles-per-second),
 * so this shared state and every chunk's stored windPhase agree at any time.
 *
 * The state stores ONLY seed and windPhase. Sway is derived, never stored.
 * Phase advances analytically from absolute time, so an unloaded chunk (or a
 * freshly created wind state) catches up in constant time without replay.
 */

import {
	hash01,
	windCyclesPerSecond
} from './MeadowChunkDeterminism.js';

/** Salt shared with MeadowChunkSimulation so both wind phases agree at t = 0. */
export const MITZVAH_WORLD_WIND_PHASE_SALT = 'meadow:wind-phase';

/**
 * Creates one shared wind state from a world seed.
 * `windPhase` starts at the seed-derived phase and advances at the seed-derived
 * wind cadence; two states from the same seed and time are identical.
 */
export function createMitzvahWorldWindState(seed, timeSeconds = 0) {
	const canonicalSeed = seed >>> 0;
	return freezeWindState({
		seed: canonicalSeed,
		windPhase: mitzvahWorldWindPhaseAt(canonicalSeed, timeSeconds)
	});
}

/** Returns the analytical wind phase for a seed at an absolute time (no replay). */
export function mitzvahWorldWindPhaseAt(seed, timeSeconds) {
	const canonicalSeed = seed >>> 0;
	const initial = hash01(canonicalSeed, MITZVAH_WORLD_WIND_PHASE_SALT);
	const cycles = windCyclesPerSecond(canonicalSeed);
	return wrapPhase(initial + cycles * Math.max(0, Number(timeSeconds) || 0));
}

/** Advances a wind state by a positive elapsed time; pure, returns a new state. */
export function advanceMitzvahWorldWindState(state, dtSeconds) {
	const current = normalizeWindState(state);
	const dt = Math.max(0, Number(dtSeconds) || 0);
	if (dt === 0) return current;
	return freezeWindState({
		seed: current.seed,
		windPhase: wrapPhase(
			current.windPhase + windCyclesPerSecond(current.seed) * dt
		)
	});
}

/** Catches a wind state up to an absolute time in constant time (no replay). */
export function catchUpMitzvahWorldWindState(state, nowSeconds) {
	const current = normalizeWindState(state);
	const target = mitzvahWorldWindPhaseAt(current.seed, nowSeconds);
	return freezeWindState({ seed: current.seed, windPhase: target });
}

/**
 * Derives one deterministic blade-sway vector for a ground position at a time.
 * The sway direction rotates with the shared phase; its strength breathes with
 * a slow gust so neighboring blades stay coherent. Returns a frozen
 * `{ swayX, swayZ }` pair in roughly [-1, 1]; grass scales it by blade height.
 */
export function mitzvahWorldWindSwayAt(state, x, z, timeSeconds) {
	const current = normalizeWindState(state);
	const time = Math.max(0, Number(timeSeconds) || 0);
	const angle = current.windPhase * Math.PI * 2
		+ Math.sin(time * 0.11 + x * 0.012 + z * 0.009) * 0.19;
	const gust = 0.58 + 0.42 * Math.sin(time * 0.17 + x * 0.021 - z * 0.017);
	return Object.freeze({
		swayX: Math.cos(angle) * gust,
		swayZ: Math.sin(angle) * gust
	});
}

/** Normalizes any wind-like record into the canonical two-field state. */
export function normalizeWindState(state = {}, fallbackSeed = 0) {
	const seed = Number.isFinite(Number(state.seed))
		? Number(state.seed) >>> 0
		: fallbackSeed >>> 0;
	return freezeWindState({
		seed,
		windPhase: wrapPhase(
			state.windPhase ?? hash01(seed, MITZVAH_WORLD_WIND_PHASE_SALT)
		)
	});
}

function freezeWindState(state) {
	return Object.freeze({ seed: state.seed, windPhase: state.windPhase });
}

function wrapPhase(value) {
	const phase = Number(value) || 0;
	return ((phase % 1) + 1) % 1;
}
