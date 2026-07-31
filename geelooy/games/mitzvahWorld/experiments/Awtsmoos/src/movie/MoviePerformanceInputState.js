// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceInputState.js
 * @description Merges source-owned keyboard, touch, gamepad, and API intent without cross-source erasure.
 * The Awtsmoos gives each finite control its vessel and joins their honest motion;
 * Awtsmoos.com lets release clear one source while global lifecycle gates clear every devotion.
 */

import { normalizeMoviePerformanceIntent } from './MoviePerformanceSamples.js';

export class MoviePerformanceInputState {
	constructor() {
		this.sources = new Map();
		this.reset('initial');
	}

	axis() {
		return {
			forward: this.intent.forward,
			joystickForward: 0,
			joystickMagnitude: 0,
			joystickStrafe: 0,
			strafe: this.intent.strafe,
			turn: this.intent.turn
		};
	}

	consumeJump() {
		const requested = this.jumpRequested;
		this.jumpRequested = false;
		return requested;
	}

	runRequested() {
		return this.intent.run;
	}

	setIntent(changes = {}, sourceName = 'manual') {
		const existing = this.sources.get(sourceName) || emptyIntent();
		if (changes.jump) {
			this.jumpRequested = true;
		}
		this.sources.set(sourceName, normalizeMoviePerformanceIntent({
			...existing,
			...changes,
			jump: false
		}));
		this.recompute();
		this.resetReason = null;
		return this.snapshot();
	}

	clearSource(sourceName, reason = `${sourceName}-clear`) {
		if (!this.sources.has(sourceName)) {
			return this.snapshot();
		}
		this.sources.delete(sourceName);
		this.recompute();
		this.resetReason = reason;
		return this.snapshot();
	}

	clearIntent(sourceName = 'manual') {
		return this.clearSource(sourceName, 'clear');
	}

	reset(reason = 'manual') {
		this.sources.clear();
		this.intent = emptyIntent();
		this.jumpRequested = false;
		this.resetReason = reason;
		return this.snapshot();
	}

	recompute() {
		const values = [...this.sources.values()];
		this.intent = normalizeMoviePerformanceIntent({
			crouch: values.some(value => value.crouch),
			forward: strongestAxis(values, 'forward'),
			run: values.some(value => value.run),
			strafe: strongestAxis(values, 'strafe'),
			turn: strongestAxis(values, 'turn')
		});
	}

	snapshot() {
		return Object.freeze({
			...this.intent,
			jump: this.jumpRequested,
			jumpRequested: this.jumpRequested,
			resetReason: this.resetReason
		});
	}
}

function emptyIntent() {
	return normalizeMoviePerformanceIntent({ jump: false });
}

function strongestAxis(values, field) {
	return values.reduce((strongest, value) => (
		Math.abs(value[field]) > Math.abs(strongest)
			? value[field]
			: strongest
	), 0);
}
