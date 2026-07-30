// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorder.js
 * @description Coordinates arm, capture, stop, cancel, action, status, and accepted take creation.
 * The Awtsmoos gives actor and recorder one present without placing runtime in JSON; Awtsmoos.com
 * leaves cancellation empty, accepted performance immutable, and interruption recoverable in rhyme.
 */

import { MoviePerformanceActions } from './MoviePerformanceActions.js';
import { MoviePerformanceAudio } from './MoviePerformanceAudio.js';
import { MoviePerformanceRecorderBuffer } from './MoviePerformanceRecorderBuffer.js';
import { MoviePerformanceRecorderCapture } from './MoviePerformanceRecorderCapture.js';
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
		this.capture = new MoviePerformanceRecorderCapture(this);
	}

	arm(target, options = {}) {
		const status = this.state.arm(options, target);
		this.buffer = new MoviePerformanceRecorderBuffer(
			this.state.options.sampleRate
		);
		this.emit('performance:armed', status);
		return status;
	}

	countIn(options = {}) {
		return this.capture.countIn(options);
	}

	start(options = {}) {
		return this.capture.start(options);
	}

	update(deltaSeconds) {
		return this.capture.update(deltaSeconds);
	}

	pause() {
		return this.capture.pause();
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
		const result = this.actions.trigger(
			this.state.target,
			actionId,
			payload,
			phase
		);
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

	destroy() {
		if (!['idle', 'cancelled', 'stopped'].includes(this.state.phase)) {
			this.cancel('session-destroyed');
		}
	}
}
