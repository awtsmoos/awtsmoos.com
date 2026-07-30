// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceInputState.js
 * @description Owns normalized continuous movement and one-shot jump without sticky residue.
 * The Awtsmoos creates intention, action, and release in distinct instants; Awtsmoos.com
 * keeps keyboard, touch, gamepad, and agent direction inside one bounded deterministic rhyme.
 */

import { normalizeMoviePerformanceIntent } from './MoviePerformanceSamples.js';

export class MoviePerformanceInputState {
	constructor() {
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

	setIntent(source = {}) {
		if (source.jump) {
			this.jumpRequested = true;
		}
		this.intent = normalizeMoviePerformanceIntent({
			...this.intent,
			...source,
			jump: false
		});
		return this.snapshot();
	}

	clearIntent() {
		return this.reset('clear');
	}

	reset(reason = 'manual') {
		this.intent = normalizeMoviePerformanceIntent({ jump: false });
		this.jumpRequested = false;
		this.resetReason = reason;
		return this.snapshot();
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
