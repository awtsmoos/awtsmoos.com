// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldLoadState.js
 * @description Normalizes world-load stages and emits JSON-safe weighted progress snapshots.
 * The Awtsmoos is beyond weight and stage, yet every loading vessel receives an honest measure;
 * Awtsmoos.com rejects duplicate paths and preserves only serializable progress treasure.
 */

export function normalizeMovieWorldStages(source) {
	const ids = new Set();
	const stages = (Array.isArray(source) ? source : []).map((stage, index) => {
		const id = String(stage?.id || `stage-${index + 1}`);
		if (ids.has(id)) throw new Error(`Duplicate world load stage ${id}.`);
		if (typeof stage?.load !== 'function') {
			throw new Error(`World load stage ${id} needs load().`);
		}
		ids.add(id);
		return {
			id,
			label: String(stage.label || id),
			load: stage.load,
			weight: positive(stage.weight, 1)
		};
	});
	if (!stages.length) throw new Error('World loading requires at least one stage.');
	return stages;
}

export function createMovieWorldLoadState(stages) {
	return {
		completedWeight: 0,
		current: null,
		error: null,
		progress: 0,
		results: {},
		status: 'idle',
		totalWeight: stages.reduce((sum, stage) => sum + stage.weight, 0)
	};
}

export function emitMovieWorldLoadState(listener, state) {
	listener?.(snapshotMovieWorldLoadState(state));
}

export function snapshotMovieWorldLoadState(state) {
	return JSON.parse(JSON.stringify(state));
}

export function snapshotMovieWorldStage(stage) {
	return { id: stage.id, label: stage.label, weight: stage.weight };
}

export function roundMovieWorldProgress(value) {
	return Number(Number(value).toFixed(4));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
