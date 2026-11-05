// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRenderJobState.js
 * @description Normalizes render progress, errors, terminal states, and immutable job snapshots.
 * The Awtsmoos renews every state beyond measurement; Awtsmoos.com keeps finite evidence
 * serializable and separate from promise, abort controller, executor, and mutable queue machinery.
 */

import {
	MOVIE_RENDER_JOB_KIND,
	MOVIE_RENDER_JOB_SNAPSHOT_VERSION
} from './MovieApiConstants.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const TERMINAL_STATES = new Set(['cancelled', 'completed', 'failed']);

export function isTerminalMovieRenderState(state) {
	return TERMINAL_STATES.has(String(state));
}

export function normalizeMovieRenderProgress(value) {
	const progress = typeof value === 'number'
		? value
		: value?.percent != null
			? Number(value.percent) / 100
			: Number(value?.progress || 0);
	return Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
}

export function movieRenderError(error, fallback = 'MOVIE_RENDER_JOB_FAILED') {
	return {
		code: error?.code || fallback,
		message: error?.message || String(error)
	};
}

export function createMovieRenderJobSnapshot(job) {
	return createMovieProjectSnapshot({
		createdAt: job.createdAt,
		error: job.error,
		finishedAt: job.finishedAt,
		id: job.id,
		kind: MOVIE_RENDER_JOB_KIND,
		progress: job.progress,
		request: job.request,
		result: job.result,
		snapshotVersion: MOVIE_RENDER_JOB_SNAPSHOT_VERSION,
		startedAt: job.startedAt,
		state: job.state
	});
}

export function requireMovieRenderExecutor(executor) {
	if (typeof executor !== 'function') {
		throw new MovieApiError(
			'INVALID_MOVIE_RENDER_EXECUTOR',
			'Movie render executor must be a function.'
		);
	}
	return executor;
}
