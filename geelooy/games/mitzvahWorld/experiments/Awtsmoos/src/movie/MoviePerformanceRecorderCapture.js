// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderCapture.js
 * @description Runs count-in, roll phases, cadence sampling, loop archiving, pause, and completion request.
 * The Awtsmoos creates anticipation, action, repetition, and release through distinct instants;
 * Awtsmoos.com keeps microphone, camera, sample, loop, and clock evidence moving in measured rhyme.
 */

import { emitMoviePerformanceClockEvents } from './MoviePerformanceRecorderEvents.js';

export class MoviePerformanceRecorderCapture {
	constructor(owner) {
		this.owner = owner;
	}

	async countIn(options = {}) {
		const seconds = Number(
			options.seconds ?? this.owner.state.options.countIn
		) || 0;
		const status = seconds
			? this.owner.state.countdown(seconds)
			: this.owner.state.start();
		emitMoviePerformanceClockEvents(this.owner);
		if (!seconds) {
			await this.startMedia();
		}
		this.owner.emit(
			seconds ? 'performance:countdown' : 'performance:started',
			status
		);
		return status;
	}

	async start(options = {}) {
		if (this.owner.state.phase === 'idle') {
			throw new Error('PERFORMANCE_NOT_ARMED');
		}
		if (!['recording', 'preRoll'].includes(this.owner.state.phase)) {
			this.owner.state.start();
		}
		await this.startMedia(options.audio);
		emitMoviePerformanceClockEvents(this.owner);
		const status = this.owner.state.snapshot();
		this.owner.emit('performance:started', status);
		return status;
	}

	update(deltaSeconds) {
		const formerPhase = this.owner.state.phase;
		let status = this.owner.state.advance(deltaSeconds);
		if (formerPhase === 'countdown'
			&& ['preRoll', 'recording'].includes(status.phase)) {
			this.startMedia();
			this.owner.emit('performance:started', status);
		}
		if (['recording', 'loopComplete'].includes(status.phase)) {
			this.sample(status);
		}
		if (status.phase === 'loopComplete') {
			this.owner.completeLoop();
			status = this.owner.state.snapshot();
		}
		emitMoviePerformanceClockEvents(this.owner);
		if (status.phase === 'readyToStop') {
			this.owner.requestAutomaticStop = true;
		}
		return this.owner.status();
	}

	pause() {
		const status = this.owner.state.pause();
		this.owner.emit('performance:paused', status);
		return status;
	}

	sample(status) {
		this.owner.archive.current.sample(
			this.owner.state.target,
			this.owner.camera,
			status.elapsed,
			this.owner.state.options
		);
		this.owner.emit('performance:sample', this.owner.status());
	}

	startMedia(options = {}) {
		if (this.owner.mediaStarted) {
			return Promise.resolve({ enabled: false, repeated: true });
		}
		this.owner.mediaStarted = true;
		return this.owner.media.start(
			this.owner.state.options.recordAudio,
			options
		);
	}
}
