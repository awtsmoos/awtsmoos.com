// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderState.js
 * @description Governs idle, armed, countdown, recording, paused, stopped, and cancelled phases.
 * The Awtsmoos creates each phase without confusing one with another; Awtsmoos.com
 * keeps performer, take name, punch range, loop count, warning, and elapsed time in honest rhyme.
 */

import { normalizeMoviePerformanceRecorderOptions } from './MoviePerformanceRecorderOptions.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export class MoviePerformanceRecorderState {
	constructor() {
		this.reset();
	}

	arm(options, target) {
		if (!target?.model) {
			throw new Error('PERFORMANCE_CHARACTER_NOT_CONTROLLABLE');
		}
		this.reset();
		this.phase = 'armed';
		this.options = normalizeMoviePerformanceRecorderOptions(options, target);
		this.target = target;
		return this.snapshot();
	}

	countdown(seconds) {
		this.requirePhase('armed');
		this.phase = 'countdown';
		this.countdownRemaining = Math.max(0, Number(seconds) || 0);
		return this.snapshot();
	}

	start() {
		if (!['armed', 'countdown', 'paused'].includes(this.phase)) {
			throw new Error(`PERFORMANCE_CANNOT_START_FROM:${this.phase}`);
		}
		this.phase = 'recording';
		return this.snapshot();
	}

	pause() {
		this.requirePhase('recording');
		this.phase = 'paused';
		return this.snapshot();
	}

	stop() {
		if (!['recording', 'paused'].includes(this.phase)) {
			throw new Error(`PERFORMANCE_CANNOT_STOP_FROM:${this.phase}`);
		}
		this.phase = 'stopped';
		return this.snapshot();
	}

	cancel(reason = 'cancelled') {
		this.phase = 'cancelled';
		this.warning = reason;
		return this.snapshot();
	}

	advance(deltaSeconds) {
		const delta = Math.max(0, Number(deltaSeconds) || 0);
		if (this.phase === 'countdown') {
			this.countdownRemaining = Math.max(0, this.countdownRemaining - delta);
			if (!this.countdownRemaining) {
				this.phase = 'recording';
			}
		}
		if (this.phase === 'recording') {
			this.elapsed += delta;
		}
		return this.snapshot();
	}

	reset() {
		this.countdownRemaining = 0;
		this.elapsed = 0;
		this.options = null;
		this.phase = 'idle';
		this.target = null;
		this.warning = null;
	}

	snapshot() {
		return Object.freeze(moviePerformanceClone({
			characterId: this.target?.id || null,
			countdownRemaining: this.countdownRemaining,
			elapsed: this.elapsed,
			options: this.options,
			phase: this.phase,
			warning: this.warning
		}));
	}

	requirePhase(phase) {
		if (this.phase !== phase) {
			throw new Error(`PERFORMANCE_PHASE_REQUIRED:${phase}`);
		}
	}
}
