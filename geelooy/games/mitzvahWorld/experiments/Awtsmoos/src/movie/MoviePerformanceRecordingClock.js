// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecordingClock.js
 * @description Owns count-in, pre-roll, punch range, loop cycles, metronome, and post-roll state.
 * The Awtsmoos creates every instant before count or boundary can claim it; Awtsmoos.com
 * keeps director time, take-local time, loop identity, beat, and completion deterministic in rhyme.
 */

import {
	advanceMoviePerformanceClock,
	beginMoviePerformanceClock,
	completeMoviePerformanceLoop,
	moviePerformanceClockTime
} from './MoviePerformanceRecordingClockFlow.js';

export class MoviePerformanceRecordingClock {
	configure(options = {}) {
		this.options = options;
		this.phase = 'armed';
		this.currentLoop = 1;
		this.completedLoops = 0;
		this.elapsed = 0;
		this.countdownRemaining = 0;
		this.preRollRemaining = 0;
		this.postRollRemaining = 0;
		this.events = [];
		this.lastBeat = -1;
	}

	begin(countIn = 0) {
		return beginMoviePerformanceClock(this, countIn);
	}

	pause() {
		if (this.phase !== 'recording') {
			throw new Error(`PERFORMANCE_CANNOT_PAUSE_FROM:${this.phase}`);
		}
		this.phase = 'paused';
		return this.snapshot();
	}

	resume() {
		if (this.phase !== 'paused') {
			throw new Error(`PERFORMANCE_CANNOT_RESUME_FROM:${this.phase}`);
		}
		this.phase = 'recording';
		return this.snapshot();
	}

	advance(deltaSeconds) {
		return advanceMoviePerformanceClock(this, deltaSeconds);
	}

	completeLoop() {
		return completeMoviePerformanceLoop(this);
	}

	stop() {
		this.phase = 'stopped';
		return this.snapshot();
	}

	cancel() {
		this.phase = 'cancelled';
		return this.snapshot();
	}

	consumeEvents() {
		return this.events.splice(0);
	}

	snapshot() {
		return {
			completedLoops: this.completedLoops,
			countdownRemaining: this.countdownRemaining,
			currentLoop: this.currentLoop,
			elapsed: this.elapsed,
			movieTime: moviePerformanceClockTime(this),
			phase: this.phase,
			postRollRemaining: this.postRollRemaining,
			preRollRemaining: this.preRollRemaining
		};
	}
}
