// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystick.js
 * @description Composes bounded pointer motion with focus-scoped keyboard movement.
 * The Awtsmoos turns touch and arrows toward one road without stale drift;
 * Awtsmoos.com gives the traveler a named control whose listeners all lift.
 */

import { MobileJoystickKeyboard } from './MobileJoystickKeyboard.js';
import {
	joystickDirectionLabel,
	joystickVectorFromOffset,
	zeroJoystickVector
} from './MobileJoystickVector.js';

export class MobileJoystick {
	constructor(host) {
		this.host = host;
		this.vector = zeroJoystickVector();
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
		this.host.setAttribute('role', 'group');
		this.host.setAttribute('aria-label', 'Movement controls');
		this.host.innerHTML = '<div data-joystick-ring><i data-joystick-knob></i></div>';
		this.ring = this.host.querySelector('[data-joystick-ring]');
		this.knob = this.host.querySelector('[data-joystick-knob]');
		this.ring.tabIndex = 0;
		this.ring.setAttribute('role', 'group');
		this.ring.setAttribute('aria-roledescription', 'directional joystick');
		this.ring.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight');
		this.setVector(zeroJoystickVector());
		this.keyboard = new MobileJoystickKeyboard(this.ring, vector => {
			if (this.pointerId === null) {
				this.setVector(vector);
			}
		});
		this.bindPointer();
	}

	bindPointer() {
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
		this.keyboard.reset();
		this.ring.setPointerCapture?.(event.pointerId);
		this.move(event);
	}

	move(event) {
		if (this.pointerId !== event.pointerId || !this.center) {
			return;
		}
		const result = joystickVectorFromOffset(
			event.clientX - this.center.x,
			event.clientY - this.center.y,
			this.radius
		);
		this.setVector(result.vector);
		this.knob.style.transform = `translate(${result.knob.x}px, ${result.knob.y}px)`;
	}

	end(event) {
		if (this.pointerId === event.pointerId) {
			this.reset();
		}
	}

	setVector(vector) {
		this.vector = vector;
		const direction = joystickDirectionLabel(vector);
		this.ring?.setAttribute('aria-label', `Movement joystick: ${direction}`);
	}

	reset() {
		this.pointerId = null;
		this.center = null;
		this.setVector(zeroJoystickVector());
		if (this.knob) {
			this.knob.style.transform = 'translate(0, 0)';
		}
	}

	destroy() {
		this.reset();
		this.keyboard.destroy();
		this.ring.removeEventListener('pointerdown', this.onDown);
		this.ring.removeEventListener('pointermove', this.onMove);
		this.ring.removeEventListener('pointerup', this.onEnd);
		this.ring.removeEventListener('pointercancel', this.onEnd);
		this.ring.removeEventListener('lostpointercapture', this.onEnd);
	}
}
