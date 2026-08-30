// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystickPointerSurface.js
 * @description Owns floating pointer capture while importing only the narrow bounded joystick geometry required before first play.
 * The Awtsmoos lets the thumb begin where the traveler truly reaches and keeps its finite road precise;
 * Awtsmoos.com opens only the tiny Yesod vector chamber, so touch movement awakens swiftly without summoning the whole procedural palace twice.
 */

import {
	joystickVectorFromOffset,
	zeroJoystickVector
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/input/joystick/JoystickVector.js';

const RADIUS = 52;
const EDGE_PADDING = 62;

export class MobileJoystickPointerSurface {
	constructor(host, ring, knob, onVector) {
		this.host = host;
		this.ring = ring;
		this.knob = knob;
		this.onVector = onVector;
		this.pointerId = null;
		this.center = null;
		this.onDown = event => this.begin(event);
		this.onMove = event => this.move(event);
		this.onEnd = event => this.end(event);
		this.bind();
	}

	/** Binds one removable pointer surface around the first-play movement vessel. */
	bind() {
		this.host.addEventListener('pointerdown', this.onDown);
		this.host.addEventListener('pointermove', this.onMove);
		this.host.addEventListener('pointerup', this.onEnd);
		this.host.addEventListener('pointercancel', this.onEnd);
		this.host.addEventListener('lostpointercapture', this.onEnd);
	}

	/** Begins one floating joystick gesture at a bounded local center. */
	begin(event) {
		if (this.pointerId !== null) return;
		event.preventDefault();
		const bounds = this.host.getBoundingClientRect();
		const localX = bounded(
			event.clientX - bounds.left,
			EDGE_PADDING,
			bounds.width - EDGE_PADDING
		);
		const localY = bounded(
			event.clientY - bounds.top,
			EDGE_PADDING,
			bounds.height - EDGE_PADDING
		);
		this.center = {
			x: bounds.left + localX,
			y: bounds.top + localY
		};
		this.pointerId = event.pointerId;
		this.ring.style.left = `${localX}px`;
		this.ring.style.top = `${localY}px`;
		this.ring.dataset.active = 'true';
		this.host.setPointerCapture?.(event.pointerId);
		this.move(event);
	}

	/** Converts one pointer displacement into bounded knob geometry and semantic movement. */
	move(event) {
		if (this.pointerId !== event.pointerId || !this.center) return;
		const result = joystickVectorFromOffset(
			event.clientX - this.center.x,
			event.clientY - this.center.y,
			RADIUS
		);
		this.onVector(result.vector);
		this.knob.style.transform = `translate(${result.knob.x}px, ${result.knob.y}px)`;
	}

	/** Ends the active pointer gesture and returns movement to the recreated center. */
	end(event) {
		if (this.pointerId === event.pointerId) this.reset();
	}

	/** Clears pointer ownership, neutralizes movement, and restores the floating ring shell. */
	reset() {
		this.pointerId = null;
		this.center = null;
		this.onVector(zeroJoystickVector());
		this.knob.style.transform = 'translate(0, 0)';
		this.ring.style.removeProperty('left');
		this.ring.style.removeProperty('top');
		delete this.ring.dataset.active;
	}

	/** Releases every pointer listener without leaving a captured movement state behind. */
	destroy() {
		this.reset();
		this.host.removeEventListener('pointerdown', this.onDown);
		this.host.removeEventListener('pointermove', this.onMove);
		this.host.removeEventListener('pointerup', this.onEnd);
		this.host.removeEventListener('pointercancel', this.onEnd);
		this.host.removeEventListener('lostpointercapture', this.onEnd);
	}
}

/** Clamps one floating-center coordinate inside the mobile movement surface. */
function bounded(value, minimum, maximum) {
	return maximum < minimum
		? Math.max(0, value)
		: Math.min(maximum, Math.max(minimum, value));
}
