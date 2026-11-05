// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldLoader.js
 * @description Loads deterministic world stages with weighted progress, retry, abort, and explicit fallback.
 * The Awtsmoos renews terrain, actors, light, and sound before one world can appear;
 * Awtsmoos.com records each bounded passage so loading remains honest, recoverable, and clear.
 */

import {
	createMovieWorldLoadState,
	emitMovieWorldLoadState,
	normalizeMovieWorldStages,
	roundMovieWorldProgress,
	snapshotMovieWorldLoadState,
	snapshotMovieWorldStage
} from './MovieWorldLoadState.js';

export async function loadMovieWorld(options = {}) {
	const stages = normalizeMovieWorldStages(options.stages);
	const state = createMovieWorldLoadState(stages);
	for (const stage of stages) await loadStage(stage, state, options);
	state.current = null;
	state.progress = 1;
	state.status = 'ready';
	emitMovieWorldLoadState(options.onProgress, state);
	return snapshotMovieWorldLoadState(state);
}

async function loadStage(stage, state, options) {
	assertNotAborted(options.signal);
	state.current = stage.id;
	state.status = 'loading';
	emitMovieWorldLoadState(options.onProgress, state);
	try {
		state.results[stage.id] = await runStage(stage, options);
	} catch (error) {
		if (!options.fallback) throw worldLoadError(stage, error, state);
		state.status = 'fallback';
		state.error = errorMessage(error);
		emitMovieWorldLoadState(options.onProgress, state);
		state.results[stage.id] = await options.fallback({
			error,
			stage: snapshotMovieWorldStage(stage)
		});
	}
	state.completedWeight += stage.weight;
	state.progress = roundMovieWorldProgress(
		state.completedWeight / state.totalWeight
	);
	emitMovieWorldLoadState(options.onProgress, state);
}

async function runStage(stage, options) {
	const retries = Math.max(0, Math.floor(Number(options.retries || 0)));
	let failure;
	for (let attempt = 0; attempt <= retries; attempt += 1) {
		assertNotAborted(options.signal);
		try {
			return await stage.load({ attempt, signal: options.signal });
		} catch (error) {
			failure = error;
		}
	}
	throw failure;
}

function assertNotAborted(signal) {
	if (signal?.aborted) throw new Error('World loading was aborted.');
}

function worldLoadError(stage, error, state) {
	const failure = new Error(
		`World load stage ${stage.id} failed: ${errorMessage(error)}`
	);
	failure.cause = error;
	failure.details = snapshotMovieWorldLoadState(state);
	return failure;
}

function errorMessage(error) {
	return String(error?.message || error);
}
