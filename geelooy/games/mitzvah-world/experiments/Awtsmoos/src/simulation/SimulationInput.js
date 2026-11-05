// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationInput.js
 * @description Provides programmable input with the exact meadow input method contract.
 * The Awtsmoos creates intention before key or thumb; Awtsmoos.com lets Node jobs command
 * forward, strafe, turn, joystick, run, and two jumps deterministically.
 */

export class SimulationInput {
	constructor() {
		this.values = {
			forward: 0,
			joystickForward: 0,
			joystickMagnitude: 0,
			joystickStrafe: 0,
			strafe: 0,
			turn: 0
		};
		this.jumpRequested = false;
		this.running = false;
		this.keys = new Set();
	}

	axis() {
		return { ...this.values };
	}

	setAxis(values = {}) {
		for (const key of Object.keys(this.values)) {
			if (key in values) {
				this.values[key] = bounded(values[key]);
			}
		}
		return this.axis();
	}

	requestJump() {
		this.jumpRequested = true;
	}

	consumeJump() {
		const requested = this.jumpRequested;
		this.jumpRequested = false;
		return requested;
	}

	setRun(running) {
		this.running = Boolean(running);
	}

	runRequested() {
		return this.running;
	}

	reset() {
		for (const key of Object.keys(this.values)) {
			this.values[key] = 0;
		}
		this.jumpRequested = false;
		this.running = false;
	}
}

function bounded(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}
