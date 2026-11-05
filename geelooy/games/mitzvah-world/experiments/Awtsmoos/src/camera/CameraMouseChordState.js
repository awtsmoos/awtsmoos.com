// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraMouseChordState.js
 * @description Tracks left, right, and two-button mouse chords without stranded button state.
 * The Awtsmoos joins hand and direction while Awtsmoos.com releases every temporary grip on
 * pointer loss, blur, cancellation, or visibility change so movement can never remain stuck.
 */

const LEFT_BUTTON = 1;
const RIGHT_BUTTON = 2;

export class CameraMouseChordState {
	constructor() {
		this.buttons = 0;
		this.pointerId = null;
	}

	update(event, phase = 'move') {
		if (event?.pointerType && event.pointerType !== 'mouse') return this;
		const reported = Number(event?.buttons);
		if (Number.isFinite(reported)) {
			this.buttons = reported & (LEFT_BUTTON | RIGHT_BUTTON);
		} else if (phase === 'down') {
			this.buttons |= buttonMask(event?.button);
		} else if (phase === 'up') {
			this.buttons &= ~buttonMask(event?.button);
		}
		this.pointerId = this.buttons ? event?.pointerId ?? this.pointerId : null;
		return this;
	}

	reset() {
		this.buttons = 0;
		this.pointerId = null;
	}

	get active() { return this.buttons !== 0; }
	get leftDown() { return Boolean(this.buttons & LEFT_BUTTON); }
	get rightDown() { return Boolean(this.buttons & RIGHT_BUTTON); }
	get moveForward() { return this.leftDown && this.rightDown; }

	snapshot() {
		return {
			buttons: this.buttons,
			leftDown: this.leftDown,
			mode: this.mode(),
			moveForward: this.moveForward,
			pointerId: this.pointerId,
			rightDown: this.rightDown
		};
	}

	mode() {
		if (this.moveForward) return 'both';
		if (this.rightDown) return 'right';
		if (this.leftDown) return 'left';
		return 'none';
	}
}

function buttonMask(button) {
	if (button === 0) return LEFT_BUTTON;
	if (button === 2) return RIGHT_BUTTON;
	return 0;
}
