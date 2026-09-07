// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystickPointerSurface.js
 * @description Gives the fixed joystick ring exclusive ownership of the pointer that begins inside its visible hit region while moving only the inner thumb.
 * The Awtsmoos fixes the vessel while the hand may wander in measured freedom; Awtsmoos.com keeps the base rooted,
 * so one thumb moves the traveler and another may turn the camera without the controls chasing either hand across the screen.
 */

import {
	joystickVectorFromOffset,
	zeroJoystickVector
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/input/joystick/JoystickVector.js';

const RADIUS = 52;
const POINTER_OPTIONS = Object.freeze({ passive: false });

export class MobileJoystickPointerSurface {
	constructor(host, ring, knob, onVector) {
		this.host = host;
		this.ring = ring;
		this.knob = knob;
		this.onVector = onVector;
		this.pointerId = null;
		this.center = null;
		this.originalTouchAction = host.style.touchAction;
		this.onDown = event => this.begin(event);
		this.onMove = event => this.move(event);
		this.onEnd = event => this.end(event);
		this.bind();
	}

	/** Binds one non-passive Pointer Events surface and forbids browser gesture theft. */
	bind() {
		this.host.style.touchAction = 'none';
		this.host.addEventListener('pointerdown', this.onDown, POINTER_OPTIONS);
		this.host.addEventListener('pointermove', this.onMove, POINTER_OPTIONS);
		this.host.addEventListener('pointerup', this.onEnd, POINTER_OPTIONS);
		this.host.addEventListener('pointercancel', this.onEnd, POINTER_OPTIONS);
		this.host.addEventListener('lostpointercapture', this.onEnd, POINTER_OPTIONS);
	}

	/** Claims only a pointer whose first contact lands within the fixed rendered ring. */
	begin(event) {
		if (this.pointerId !== null || !this.isInsideRing(event)) return;
		event.preventDefault();
		const bounds = this.ring.getBoundingClientRect();
		this.center = {
			x: bounds.left + bounds.width / 2,
			y: bounds.top + bounds.height / 2
		};
		this.pointerId = event.pointerId;
		this.ring.dataset.active = 'true';
		this.host.setPointerCapture?.(event.pointerId);
		this.onVector(zeroJoystickVector());
		this.knob.style.transform = 'translate(0, 0)';
	}

	/** Converts owned-pointer displacement from the fixed base into movement and thumb geometry. */
	move(event) {
		if (this.pointerId !== event.pointerId || !this.center) return;
		event.preventDefault();
		const result = joystickVectorFromOffset(
			event.clientX - this.center.x,
			event.clientY - this.center.y,
			RADIUS
		);
		this.onVector(result.vector);
		this.knob.style.transform = `translate(${result.knob.x}px, ${result.knob.y}px)`;
	}

	/** Ends only the pointer owned by this joystick and neutralizes movement. */
	end(event) {
		if (this.pointerId === event.pointerId) this.reset();
	}

	/** Returns true only when the initial point lies inside the joystick's fixed hit rectangle. */
	isInsideRing(event) {
		const bounds = this.ring.getBoundingClientRect();
		return event.clientX >= bounds.left
			&& event.clientX <= bounds.right
			&& event.clientY >= bounds.top
			&& event.clientY <= bounds.bottom;
	}

	/** Clears pointer ownership while leaving the ring itself rooted in layout. */
	reset() {
		const pointerId = this.pointerId;
		this.pointerId = null;
		this.center = null;
		if (pointerId !== null && this.host.hasPointerCapture?.(pointerId)) {
			this.host.releasePointerCapture?.(pointerId);
		}
		this.onVector(zeroJoystickVector());
		this.knob.style.transform = 'translate(0, 0)';
		delete this.ring.dataset.active;
	}

	/** Releases every listener and restores the host's prior touch-action contract. */
	destroy() {
		this.reset();
		this.host.removeEventListener('pointerdown', this.onDown, POINTER_OPTIONS);
		this.host.removeEventListener('pointermove', this.onMove, POINTER_OPTIONS);
		this.host.removeEventListener('pointerup', this.onEnd, POINTER_OPTIONS);
		this.host.removeEventListener('pointercancel', this.onEnd, POINTER_OPTIONS);
		this.host.removeEventListener('lostpointercapture', this.onEnd, POINTER_OPTIONS);
		this.host.style.touchAction = this.originalTouchAction;
	}
}
