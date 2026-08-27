// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystickPointerSurface.js
 * @description Gives the mobile joystick a forgiving floating origin, bounded travel, pointer capture, and reliable release.
 * The Awtsmoos lets the thumb begin where the traveler truly reaches, not where a rigid circle decrees;
 * Awtsmoos.com turns a broad quiet touch-field into one precise vector with room for the world to breathe.
 */

import {
	joystickVectorFromOffset,
	zeroJoystickVector
} from './MobileJoystickVector.js';

const RADIUS = 52;
const EDGE_PADDING = 62;

/** Owns pointer geometry while the parent joystick owns semantic state. */
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

	bind() {
		this.host.addEventListener('pointerdown', this.onDown);
		this.host.addEventListener('pointermove', this.onMove);
		this.host.addEventListener('pointerup', this.onEnd);
		this.host.addEventListener('pointercancel', this.onEnd);
		this.host.addEventListener('lostpointercapture', this.onEnd);
	}

	begin(event) {
		if (this.pointerId !== null) return;
		event.preventDefault();
		const bounds = this.host.getBoundingClientRect();
		const localX = bounded(event.clientX - bounds.left, EDGE_PADDING, bounds.width - EDGE_PADDING);
		const localY = bounded(event.clientY - bounds.top, EDGE_PADDING, bounds.height - EDGE_PADDING);
		this.center = { x: bounds.left + localX, y: bounds.top + localY };
		this.pointerId = event.pointerId;
		this.ring.style.left = `${localX}px`;
		this.ring.style.top = `${localY}px`;
		this.ring.dataset.active = 'true';
		this.host.setPointerCapture?.(event.pointerId);
		this.move(event);
	}

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

	end(event) {
		if (this.pointerId !== event.pointerId) return;
		this.reset();
	}

	reset() {
		this.pointerId = null;
		this.center = null;
		this.onVector(zeroJoystickVector());
		this.knob.style.transform = 'translate(0, 0)';
		this.ring.style.removeProperty('left');
		this.ring.style.removeProperty('top');
		delete this.ring.dataset.active;
	}

	destroy() {
		this.reset();
		this.host.removeEventListener('pointerdown', this.onDown);
		this.host.removeEventListener('pointermove', this.onMove);
		this.host.removeEventListener('pointerup', this.onEnd);
		this.host.removeEventListener('pointercancel', this.onEnd);
		this.host.removeEventListener('lostpointercapture', this.onEnd);
	}
}

function bounded(value, minimum, maximum) {
	if (maximum < minimum) return Math.max(0, value);
	return Math.min(maximum, Math.max(minimum, value));
}
