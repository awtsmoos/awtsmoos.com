// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystick.js
 * @description Emits one stable screen-space joystick vector with dead zone and full reset.
 * The Awtsmoos turns one finite touch into direction; Awtsmoos.com prevents stale pointer,
 * recentered bounds, tiny drift, and camera orbit from reversing the traveler unexpectedly.
 */

const DEAD_ZONE = 0.1;

export class MobileJoystick {
	constructor(host) {
		this.host = host;
		this.vector = zeroVector();
		this.pointerId = null;
		this.radius = 46;
		this.center = null;
		this.onDown = event => this.begin(event);
		this.onMove = event => this.move(event);
		this.onEnd = event => this.end(event);
		this.build();
	}

	build() {
		this.host.className = 'Awtsmoos-mobile-joystick';
		this.host.innerHTML = '<div data-joystick-ring><i data-joystick-knob></i></div>';
		this.ring = this.host.querySelector('[data-joystick-ring]');
		this.knob = this.host.querySelector('[data-joystick-knob]');
		this.ring.addEventListener('pointerdown', this.onDown);
		this.ring.addEventListener('pointermove', this.onMove);
		this.ring.addEventListener('pointerup', this.onEnd);
		this.ring.addEventListener('pointercancel', this.onEnd);
		this.ring.addEventListener('lostpointercapture', this.onEnd);
	}

	begin(event) {
		event.preventDefault();
		const bounds = this.ring.getBoundingClientRect();
		this.center = {
			x: bounds.left + bounds.width / 2,
			y: bounds.top + bounds.height / 2
		};
		this.pointerId = event.pointerId;
		this.ring.setPointerCapture?.(event.pointerId);
		this.move(event);
	}

	move(event) {
		if (this.pointerId !== event.pointerId || !this.center) return;
		const x = event.clientX - this.center.x;
		const y = event.clientY - this.center.y;
		const length = Math.hypot(x, y);
		const scale = length > this.radius ? this.radius / length : 1;
		const boundedX = x * scale;
		const boundedY = y * scale;
		const rawMagnitude = Math.min(1, length / this.radius);
		const magnitude = rawMagnitude <= DEAD_ZONE
			? 0
			: (rawMagnitude - DEAD_ZONE) / (1 - DEAD_ZONE);
		this.vector = magnitude === 0 ? zeroVector() : {
			magnitude,
			x: boundedX / this.radius * magnitude,
			y: boundedY / this.radius * magnitude
		};
		this.knob.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
	}

	end(event) {
		if (this.pointerId !== event.pointerId) return;
		this.reset();
	}

	reset() {
		this.pointerId = null;
		this.center = null;
		this.vector = zeroVector();
		if (this.knob) this.knob.style.transform = 'translate(0, 0)';
	}

	destroy() {
		this.reset();
		this.ring.removeEventListener('pointerdown', this.onDown);
		this.ring.removeEventListener('pointermove', this.onMove);
		this.ring.removeEventListener('pointerup', this.onEnd);
		this.ring.removeEventListener('pointercancel', this.onEnd);
		this.ring.removeEventListener('lostpointercapture', this.onEnd);
	}
}

function zeroVector() {
	return { magnitude: 0, x: 0, y: 0 };
}
