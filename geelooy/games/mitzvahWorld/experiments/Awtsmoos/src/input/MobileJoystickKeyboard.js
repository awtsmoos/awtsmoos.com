// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystickKeyboard.js
 * @description Gives the focused mobile joystick removable arrow-key movement through the narrow neutral-vector law required before first play.
 * The Awtsmoos gathers four arrows into one honest vector, near and clear;
 * Awtsmoos.com reaches only for the tiny Yesod joystick vessel, so the whole procedural palace need not awaken here.
 */

import {
	zeroJoystickVector
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/input/joystick/JoystickVector.js';

const ARROW_DIRECTIONS = Object.freeze({
	ArrowDown: { x: 0, y: 1 },
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
	ArrowUp: { x: 0, y: -1 }
});

export class MobileJoystickKeyboard {
	constructor(element, onVector) {
		this.element = element;
		this.onVector = onVector;
		this.pressed = new Set();
		this.onKeyDown = event => this.press(event);
		this.onKeyUp = event => this.release(event);
		this.onBlur = () => this.reset();
		this.bind();
	}

	/** Binds the finite arrow-key listeners that feed one semantic joystick vector. */
	bind() {
		this.element.addEventListener('keydown', this.onKeyDown);
		this.element.addEventListener('keyup', this.onKeyUp);
		this.element.addEventListener('blur', this.onBlur);
	}

	/** Records one supported arrow and republishes normalized movement intent. */
	press(event) {
		if (!ARROW_DIRECTIONS[event.key]) return;
		event.preventDefault();
		this.pressed.add(event.key);
		this.publish();
	}

	/** Releases one supported arrow and refreshes the surviving movement intent. */
	release(event) {
		if (!ARROW_DIRECTIONS[event.key]) return;
		event.preventDefault();
		this.pressed.delete(event.key);
		this.publish();
	}

	/** Publishes a unit vector for the combined arrows without sharing mutable neutral state. */
	publish() {
		let x = 0;
		let y = 0;
		for (const key of this.pressed) {
			x += ARROW_DIRECTIONS[key].x;
			y += ARROW_DIRECTIONS[key].y;
		}
		const length = Math.hypot(x, y);
		this.onVector(
			length === 0
				? zeroJoystickVector()
				: { magnitude: 1, x: x / length, y: y / length }
		);
	}

	/** Returns the focused joystick to the Awtsmoos-created neutral center. */
	reset() {
		if (this.pressed.size === 0) return;
		this.pressed.clear();
		this.onVector(zeroJoystickVector());
	}

	/** Releases every listener and leaves no finite movement residue behind. */
	destroy() {
		this.reset();
		this.element.removeEventListener('keydown', this.onKeyDown);
		this.element.removeEventListener('keyup', this.onKeyUp);
		this.element.removeEventListener('blur', this.onBlur);
	}
}
