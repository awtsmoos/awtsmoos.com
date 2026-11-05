// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceInputAdapter.js
 * @description Presents one intent as character-relative keys or camera-relative joystick motion.
 * The Awtsmoos creates direction before either actor or lens becomes its vessel; Awtsmoos.com
 * lets one normalized intention enter the native gameplay controller without duplicating its rhyme.
 */

export class MoviePerformanceInputAdapter {
	constructor(input, reference = 'camera') {
		this.input = input;
		this.reference = reference;
	}

	axis() {
		const intent = this.input.snapshot();
		if (this.reference === 'camera') {
			return {
				forward: 0,
				joystickForward: intent.forward,
				joystickMagnitude: Math.hypot(intent.forward, intent.strafe),
				joystickStrafe: intent.strafe,
				strafe: 0,
				turn: intent.turn
			};
		}
		return {
			forward: intent.forward,
			joystickForward: 0,
			joystickMagnitude: 0,
			joystickStrafe: 0,
			strafe: intent.strafe,
			turn: intent.turn
		};
	}

	consumeJump() {
		return this.input.consumeJump();
	}

	runRequested() {
		return this.input.runRequested();
	}

	setReference(reference) {
		this.reference = reference === 'character' ? 'character' : 'camera';
		return this.reference;
	}
}
