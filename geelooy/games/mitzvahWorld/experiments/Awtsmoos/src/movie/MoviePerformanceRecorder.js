// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorder.js
 * @description Coordinates arm, ranged capture, loop takes, stop, cancel, actions, and optional media.
 * The Awtsmoos gives actor and recorder one present without placing runtime in JSON; Awtsmoos.com
 * leaves cancellation empty, loop performances distinct, and accepted evidence recoverable in rhyme.
 */

import { MoviePerformanceActions } from './MoviePerformanceActions.js';
import { MoviePerformanceAudio } from './MoviePerformanceAudio.js';
import { emitMoviePerformanceAudioFailure } from './MoviePerformanceAudioFailure.js';
import { MoviePerformanceRecorderArchive } from './MoviePerformanceRecorderArchive.js';
import { MoviePerformanceRecorderCapture } from './MoviePerformanceRecorderCapture.js';
import { MoviePerformanceRecorderMedia } from './MoviePerformanceRecorderMedia.js';
import { MoviePerformanceRecorderOperations } from './MoviePerformanceRecorderOperations.js';
import { MoviePerformanceRecorderState } from './MoviePerformanceRecorderState.js';

export class MoviePerformanceRecorder extends MoviePerformanceRecorderOperations {
	constructor(options = {}) {
		super();
		this.camera = options.camera;
		this.emit = options.emit || (() => {});
		this.state = new MoviePerformanceRecorderState();
		const audio = options.audio || new MoviePerformanceAudio(
			options.environment,
			(error, phase) => emitMoviePerformanceAudioFailure(
				this.emit,
				error,
				phase
			)
		);
		this.media = new MoviePerformanceRecorderMedia(audio, this.emit);
		this.actions = new MoviePerformanceActions({
			now: () => this.state.elapsed,
			onEvent: event => this.archive?.current.addAction(event)
		});
		this.capture = new MoviePerformanceRecorderCapture(this);
	}

	arm(target, options = {}) {
		const status = this.state.arm(options, target);
		this.archive = new MoviePerformanceRecorderArchive(
			this.state.options.sampleRate
		);
		this.mediaStarted = false;
		this.requestAutomaticStop = false;
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
		if (this.archive.current.transformSamples.length) {
			this.archive.complete(
				this.state.clock.currentLoop,
				this.state.elapsed
			);
		}
		if (!this.archive.entries.length) {
			throw new Error('PERFORMANCE_RECORDING_EMPTY');
		}
		this.state.stop();
		const audio = await this.media.stop();
		const takes = this.archive.build(this.state, {
			...options,
			audioError: audio?.error || this.media.error
		});
		this.requestAutomaticStop = false;
		this.emit('performance:stopped', this.status());
		return {
			audio,
			take: takes[0],
			takes
		};
	}

	cancel(reason = 'cancelled') {
		this.media.cancel();
		this.actions.clear();
		this.archive?.reset();
		this.requestAutomaticStop = false;
		const status = this.state.cancel(reason);
		this.emit('performance:cancelled', status);
		return status;
	}
}
