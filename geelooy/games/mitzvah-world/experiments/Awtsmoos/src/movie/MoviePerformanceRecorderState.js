// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderState.js
 * @description Owns armed performer and delegates count, range, loop, pause, and roll timing to one clock.
 * The Awtsmoos creates each phase without confusion while actor identity remains distinct;
 * Awtsmoos.com keeps live target outside JSON and immutable status inside a bounded cinematic rhyme.
 */

import { MoviePerformanceRecordingClock } from './MoviePerformanceRecordingClock.js';
import { normalizeMoviePerformanceRecorderOptions } from './MoviePerformanceRecorderOptions.js';
import {
	moviePerformanceRecorderCanStop,
	requireMoviePerformanceRecorderPhase
} from './MoviePerformanceRecorderPhase.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export class MoviePerformanceRecorderState {
	constructor() {
		this.clock = new MoviePerformanceRecordingClock();
		this.reset();
	}

	get phase() {
		return this.clock.phase;
	}

	get elapsed() {
		return this.clock.elapsed;
	}

	arm(options, target) {
		if (!target?.model) {
			throw new Error('PERFORMANCE_CHARACTER_NOT_CONTROLLABLE');
		}
		this.options = normalizeMoviePerformanceRecorderOptions(options, target);
		this.target = target;
		this.warning = null;
		this.clock.configure(this.options);
		return this.snapshot();
	}

	countdown(seconds) {
		requireMoviePerformanceRecorderPhase(this.phase, 'armed');
		this.clock.begin(seconds);
		return this.snapshot();
	}

	start() {
		if (this.phase === 'paused') {
			this.clock.resume();
			return this.snapshot();
		}
		if (this.phase !== 'armed' && this.phase !== 'countdown') {
			throw new Error(`PERFORMANCE_CANNOT_START_FROM:${this.phase}`);
		}
		this.clock.begin(0);
		return this.snapshot();
	}

	pause() {
		this.clock.pause();
		return this.snapshot();
	}

	stop() {
		if (!moviePerformanceRecorderCanStop(this.phase)) {
			throw new Error(`PERFORMANCE_CANNOT_STOP_FROM:${this.phase}`);
		}
		this.clock.stop();
		return this.snapshot();
	}

	cancel(reason = 'cancelled') {
		this.warning = reason;
		this.clock.cancel();
		return this.snapshot();
	}

	advance(deltaSeconds) {
		this.clock.advance(deltaSeconds);
		return this.snapshot();
	}

	completeLoop() {
		this.clock.completeLoop();
		return this.snapshot();
	}

	consumeEvents() {
		return this.clock.consumeEvents();
	}

	reset() {
		this.options = null;
		this.target = null;
		this.warning = null;
		this.clock.configure({
			inPoint: 0,
			loopCount: 1,
			metronome: false,
			outPoint: null,
			postRoll: 0,
			preRoll: 0
		});
		this.clock.phase = 'idle';
	}

	snapshot() {
		return Object.freeze(moviePerformanceClone({
			characterId: this.target?.id || null,
			options: this.options,
			warning: this.warning,
			...this.clock.snapshot()
		}));
	}
}
