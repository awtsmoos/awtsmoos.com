// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorder.js
 * @description Coordinates arm, count-in, live sampling, pause, stop, cancel, action, and take creation.
 * The Awtsmoos gives actor and recorder one present without placing runtime in JSON; Awtsmoos.com
 * leaves cancellation empty, accepted performance immutable, and interrupted evidence recoverable in rhyme.
 */

import { MoviePerformanceActions } from './MoviePerformanceActions.js';
import { MoviePerformanceAudio } from './MoviePerformanceAudio.js';
import { MoviePerformanceRecorderBuffer } from './MoviePerformanceRecorderBuffer.js';
import { MoviePerformanceRecorderMedia } from './MoviePerformanceRecorderMedia.js';
import { MoviePerformanceRecorderState } from './MoviePerformanceRecorderState.js';
import { buildMoviePerformanceTake } from './MoviePerformanceTakeBuilder.js';

export class MoviePerformanceRecorder {
	constructor(options = {}) {
		this.camera = options.camera;
		this.emit = options.emit || (() => {});
		this.state = new MoviePerformanceRecorderState();
		this.media = new MoviePerformanceRecorderMedia(
			options.audio || new MoviePerformanceAudio(options.environment)
		);
		this.actions = new MoviePerformanceActions({
			now: () => this.state.elapsed,
			onEvent: event => this.buffer?.addAction(event)
		});
	}

	arm(target, options = {}) {
		this.buffer = new MoviePerformanceRecorderBuffer(options.sampleRate || 30);
		const status = this.state.arm(options, target);
		this.emit('performance:armed', status);
		return status;
	}

	async countIn(options = {}) {
		const seconds = Number(options.seconds ?? this.state.options.countIn) || 0;
		const status = seconds ? this.state.countdown(seconds) : this.state.start();
		if (seconds) {
			this.emit('performance:countdown', status);
		} else {
			await this.startMedia();
			this.emit('performance:started', status);
		}
		return status;
	}

	async start(options = {}) {
		if (this.state.phase === 'idle') {
			throw new Error('PERFORMANCE_NOT_ARMED');
		}
		if (this.state.phase !== 'recording') {
			this.state.start();
		}
		await this.startMedia(options.audio);
		const status = this.state.snapshot();
		this.emit('performance:started', status);
		return status;
	}

	update(deltaSeconds) {
		const previousPhase = this.state.phase;
		const status = this.state.advance(deltaSeconds);
		if (previousPhase === 'countdown' && status.phase === 'recording') {
			this.startMedia();
			this.emit('performance:started', status);
		}
		if (status.phase === 'recording') {
			this.buffer.sample(
				this.state.target,
				this.camera,
				status.elapsed,
				this.state.options
			);
			this.emit('performance:sample', this.status());
		}
		return this.status();
	}

	pause() {
		const status = this.state.pause();
		this.emit('performance:paused', status);
		return status;
	}

	async stop(options = {}) {
		this.state.stop();
		const audio = await this.media.stop();
		const take = buildMoviePerformanceTake(this.state, this.buffer, {
			...options,
			audioError: audio?.error || this.media.error
		});
		this.emit('performance:stopped', this.status());
		return { audio, take };
	}

	cancel(reason = 'cancelled') {
		this.media.cancel();
		this.actions.clear();
		this.buffer?.reset();
		const status = this.state.cancel(reason);
		this.emit('performance:cancelled', status);
		return status;
	}

	triggerAction(actionId, payload, phase) {
		const result = this.actions.trigger(this.state.target, actionId, payload, phase);
		if (result.event) {
			this.emit('performance:action', result.event);
		}
		return result;
	}

	status() {
		return Object.freeze({
			...this.state.snapshot(),
			droppedSamples: this.buffer?.droppedSamples || 0,
			sampleCount: this.buffer?.transformSamples.length || 0
		});
	}

	startMedia(options = {}) {
		return this.media.start(this.state.options.recordAudio, options);
	}

	destroy() {
		if (!['idle', 'cancelled', 'stopped'].includes(this.state.phase)) {
			this.cancel('session-destroyed');
		}
	}
}
