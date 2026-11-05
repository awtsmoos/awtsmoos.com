//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJoystick.js
 * @description Composes a visibly discoverable, accessible mobile movement vessel while importing only the tiny renderer-free joystick law required before first paint.
 * The Awtsmoos gives the thumb a ring that can be seen and a road that can be known;
 * Awtsmoos.com joins the same semantic vector to touch and keys, so swift first play never hides the keli through which motion is shown.
 */

import {
	joystickDirectionLabel,
	zeroJoystickVector
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/input/joystick/JoystickVector.js';
import { MobileJoystickKeyboard } from './MobileJoystickKeyboard.js';
import { MobileJoystickPointerSurface } from './MobileJoystickPointerSurface.js';

export class MobileJoystick {
	constructor(host) {
		this.host = host;
		this.vector = zeroJoystickVector();
		this.environment = host?.ownerDocument?.defaultView || globalThis;
		this.document = host?.ownerDocument || globalThis.document;
		this.onLifecycleReset = () => this.reset();
		this.onVisibilityChange = () => {
			if (this.document?.hidden) {
				this.reset();
			}
		};
		this.build();
	}

	/** Builds the visible joystick shell whose class contract matches the production stylesheet exactly. */
	build() {
		this.host.className = 'Awtsmoos-mobile-joystick';
		this.host.dataset.directHudZone = 'movement';
		this.host.dataset.joystickReady = 'false';
		this.host.setAttribute('role', 'group');
		this.host.setAttribute('aria-label', 'Movement touch area');
		this.host.innerHTML = [
			'<div class="Awtsmoos-joystick-ring" data-joystick-ring>',
				'<i class="Awtsmoos-joystick-knob" data-joystick-knob></i>',
			'</div>'
		].join('');
		this.ring = this.host.querySelector('[data-joystick-ring]');
		this.knob = this.host.querySelector('[data-joystick-knob]');
		this.ring.tabIndex = 0;
		this.ring.setAttribute('role', 'group');
		this.ring.setAttribute('aria-roledescription', 'floating directional joystick');
		this.ring.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight');
		this.surface = new MobileJoystickPointerSurface(
			this.host,
			this.ring,
			this.knob,
			vector => this.setVector(vector)
		);
		this.keyboard = new MobileJoystickKeyboard(this.ring, vector => {
			if (this.surface.pointerId === null) {
				this.setVector(vector);
			}
		});
		this.bindLifecycle();
		this.setVector(zeroJoystickVector());
		this.host.dataset.joystickReady = 'true';
	}

	/** Binds lifecycle resets so stale touch state never survives a viewport transition. */
	bindLifecycle() {
		this.environment?.addEventListener?.('blur', this.onLifecycleReset);
		this.environment?.addEventListener?.('resize', this.onLifecycleReset);
		this.environment?.addEventListener?.('orientationchange', this.onLifecycleReset);
		this.document?.addEventListener?.('visibilitychange', this.onVisibilityChange);
	}

	/** Stores semantic movement and refreshes assistive direction language. */
	setVector(vector) {
		this.vector = vector;
		this.ring?.setAttribute(
			'aria-label',
			`Movement joystick: ${joystickDirectionLabel(vector)}`
		);
	}

	/** Returns pointer and keyboard movement to a freshly recreated neutral vector. */
	reset() {
		this.keyboard?.reset?.();
		this.surface?.reset?.();
		if (!this.surface) {
			this.setVector(zeroJoystickVector());
		}
	}

	/** Releases listeners and child controllers without leaving movement residue behind. */
	destroy() {
		this.keyboard?.destroy?.();
		this.surface?.destroy?.();
		this.environment?.removeEventListener?.('blur', this.onLifecycleReset);
		this.environment?.removeEventListener?.('resize', this.onLifecycleReset);
		this.environment?.removeEventListener?.('orientationchange', this.onLifecycleReset);
		this.document?.removeEventListener?.('visibilitychange', this.onVisibilityChange);
		this.host.dataset.joystickReady = 'false';
		this.setVector(zeroJoystickVector());
	}
}
