// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystick.js
 * @description Composes a floating touch surface with focus-scoped keyboard movement and lifecycle-safe reset.
 * The Awtsmoos turns touch and arrows toward one road without stale drift;
 * Awtsmoos.com lets the thumb arrive anywhere in its generous field and still find the gift.
 */

import { MobileJoystickKeyboard } from './MobileJoystickKeyboard.js';
import { MobileJoystickPointerSurface } from './MobileJoystickPointerSurface.js';
import {
	joystickDirectionLabel,
	zeroJoystickVector
} from './MobileJoystickVector.js';

export class MobileJoystick {
	constructor(host) {
		this.host = host;
		this.vector = zeroJoystickVector();
		this.environment = host?.ownerDocument?.defaultView || globalThis;
		this.document = host?.ownerDocument || globalThis.document;
		this.onLifecycleReset = () => this.reset();
		this.onVisibilityChange = () => {
			if (this.document?.hidden) this.reset();
		};
		this.build();
	}

	build() {
		this.host.className = 'Awtsmoos-mobile-joystick';
		this.host.setAttribute('role', 'group');
		this.host.setAttribute('aria-label', 'Movement touch area');
		this.host.innerHTML = '<div data-joystick-ring><i data-joystick-knob></i></div>';
		this.ring = this.host.querySelector('[data-joystick-ring]');
		this.knob = this.host.querySelector('[data-joystick-knob]');
		this.ring.tabIndex = 0;
		this.ring.setAttribute('role', 'group');
		this.ring.setAttribute('aria-roledescription', 'floating directional joystick');
		this.ring.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight');
		this.keyboard = new MobileJoystickKeyboard(this.ring, vector => {
			if (this.surface.pointerId === null) this.setVector(vector);
		});
		this.surface = new MobileJoystickPointerSurface(
			this.host,
			this.ring,
			this.knob,
			vector => this.setVector(vector)
		);
		this.bindLifecycle();
		this.setVector(zeroJoystickVector());
	}

	bindLifecycle() {
		this.environment?.addEventListener?.('blur', this.onLifecycleReset);
		this.environment?.addEventListener?.('resize', this.onLifecycleReset);
		this.environment?.addEventListener?.('orientationchange', this.onLifecycleReset);
		this.document?.addEventListener?.('visibilitychange', this.onVisibilityChange);
	}

	setVector(vector) {
		this.vector = vector;
		const direction = joystickDirectionLabel(vector);
		this.ring?.setAttribute('aria-label', `Movement joystick: ${direction}`);
	}

	reset() {
		this.keyboard?.reset?.();
		this.surface?.reset?.();
		if (!this.surface) this.setVector(zeroJoystickVector());
	}

	destroy() {
		this.keyboard?.destroy?.();
		this.surface?.destroy?.();
		this.environment?.removeEventListener?.('blur', this.onLifecycleReset);
		this.environment?.removeEventListener?.('resize', this.onLifecycleReset);
		this.environment?.removeEventListener?.('orientationchange', this.onLifecycleReset);
		this.document?.removeEventListener?.('visibilitychange', this.onVisibilityChange);
		this.setVector(zeroJoystickVector());
	}
}
