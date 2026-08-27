// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRenderJob.js
 * @description Owns one render lifecycle with immutable state, progress, cancellation, and waiting.
 * The Awtsmoos renews queue, work, completion, and failure in one present; Awtsmoos.com
 * gives agents stable job identity while executor, abort controller, and promises remain local.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import {
	createMovieRenderJobSnapshot,
	isTerminalMovieRenderState,
	movieRenderError,
	normalizeMovieRenderProgress,
	requireMovieRenderExecutor
} from './MovieRenderJobState.js';

export class MovieRenderJob {
	constructor(id, request, events) {
		this.id = String(id);
		this.request = canonicalMovieValue(request);
		this.events = events;
		this.controller = new AbortController();
		this.state = 'queued';
		this.progress = 0;
		this.result = null;
		this.error = null;
		this.createdAt = new Date().toISOString();
		this.startedAt = null;
		this.finishedAt = null;
		this.promise = null;
	}

	start(executor) {
		if (this.promise) return this.promise;
		this.promise = this.run(requireMovieRenderExecutor(executor));
		return this.promise;
	}

	async run(executor) {
		if (this.controller.signal.aborted) return this.cancelled();
		this.transition('preparing');
		this.startedAt = new Date().toISOString();
		try {
			this.transition('rendering');
			const result = await executor({
				onProgress: value => this.updateProgress(value),
				request: this.request,
				signal: this.controller.signal
			});
			if (this.controller.signal.aborted) return this.cancelled();
			this.progress = 1;
			this.result = canonicalMovieValue(result);
			this.transition('completed');
			return this.snapshot();
		} catch (error) {
			if (this.controller.signal.aborted) return this.cancelled();
			this.error = movieRenderError(error);
			this.transition('failed');
			return this.snapshot();
		}
	}

	cancel(reason = 'Cancelled by caller') {
		if (isTerminalMovieRenderState(this.state)) return false;
		this.controller.abort(String(reason));
		if (!this.promise || this.state === 'queued') this.cancelled();
		this.events?.emit('render:cancelled', {
			jobId: this.id,
			reason: String(reason)
		});
		return true;
	}

	updateProgress(value) {
		this.progress = normalizeMovieRenderProgress(value);
		this.events?.emit('render:progress', {
			jobId: this.id,
			progress: this.progress,
			state: this.state
		});
	}

	transition(state) {
		this.state = state;
		if (isTerminalMovieRenderState(state)) {
			this.finishedAt = new Date().toISOString();
		}
		this.events?.emit('render:state', {
			jobId: this.id,
			progress: this.progress,
			state
		});
	}

	cancelled() {
		this.error = movieRenderError(
			new Error(String(this.controller.signal.reason || 'Render cancelled.')),
			'MOVIE_RENDER_JOB_CANCELLED'
		);
		this.error.code = 'MOVIE_RENDER_JOB_CANCELLED';
		this.transition('cancelled');
		return this.snapshot();
	}

	async wait() {
		if (this.promise) await this.promise;
		return this.snapshot();
	}

	snapshot() {
		return createMovieRenderJobSnapshot(this);
	}
}
