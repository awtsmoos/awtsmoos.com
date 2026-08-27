// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRenderQueue.js
 * @description Owns bounded render jobs, executor lookup, cancellation, waiting, and immutable listing.
 * The Awtsmoos renews every job without losing its finite witness; Awtsmoos.com keeps
 * active work and recent terminal history queryable while pruning only completed old vessels.
 */

import { MovieApiError } from './MovieApiError.js';
import { MovieRenderJob } from './MovieRenderJob.js';
import { isTerminalMovieRenderState } from './MovieRenderJobState.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { createMovieRuntimeId } from './MovieRuntimeId.js';

export class MovieRenderQueue {
	constructor(events, options = {}) {
		this.events = events;
		this.limit = Math.max(1, Number(options.limit) || 32);
		this.executors = new Map();
		this.jobs = new Map();
	}

	registerExecutor(mode, executor) {
		const key = String(mode);
		if (typeof executor !== 'function') {
			throw new MovieApiError(
				'INVALID_MOVIE_RENDER_EXECUTOR',
				`Movie render executor ${key} must be a function.`
			);
		}
		this.executors.set(key, executor);
		return key;
	}

	start(request = {}) {
		const mode = String(request.mode || 'live');
		const executor = this.executors.get(mode);
		if (!executor) {
			throw new MovieApiError(
				'MOVIE_RENDER_MODE_NOT_FOUND',
				`Movie render mode ${mode} is not registered.`,
				{ mode }
			);
		}
		const job = new MovieRenderJob(
			createMovieRuntimeId('render'),
			{ ...request, mode },
			this.events
		);
		this.jobs.set(job.id, job);
		job.start(executor).finally(() => this.prune());
		return job.snapshot();
	}

	get(id) {
		const job = this.jobs.get(String(id));
		if (!job) {
			throw new MovieApiError(
				'MOVIE_RENDER_JOB_NOT_FOUND',
				`Movie render job ${id} was not found.`,
				{ jobId: String(id) }
			);
		}
		return job;
	}

	list() {
		return createMovieProjectSnapshot(
			[...this.jobs.values()]
				.map(job => job.snapshot())
				.sort((left, right) => left.createdAt.localeCompare(right.createdAt))
		);
	}

	cancel(id, reason) {
		const job = this.get(id);
		return {
			cancelled: job.cancel(reason),
			job: job.snapshot()
		};
	}

	wait(id) {
		return this.get(id).wait();
	}

	prune() {
		const terminal = [...this.jobs.values()].filter(job => (
			isTerminalMovieRenderState(job.state)
		));
		while (terminal.length > this.limit) {
			const job = terminal.shift();
			this.jobs.delete(job.id);
		}
	}

	clear() {
		for (const job of this.jobs.values()) {
			if (!isTerminalMovieRenderState(job.state)) job.cancel('Queue cleared');
		}
		this.jobs.clear();
		this.executors.clear();
	}
}
