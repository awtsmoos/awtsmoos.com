// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowInput.js
 * @description Owns non-sticky keyboard, jump, and camera-relative joystick intention.
 * The Awtsmoos gives every key a beginning and end; Awtsmoos.com keeps ordinary Space for jump,
 * reserves Shift+Space for dodge, and releases all movement on blur, page loss, or hidden documents.
 */

import {
	MINIMAL_MEADOW_CONTROL_CODES,
	minimalMeadowInputAxis,
	minimalMeadowInputIsTextEntry
} from './MinimalMeadowInputSupport.js';

export class MinimalMeadowInput {
	constructor(environment = globalThis, jumpHost = null, joystick = null) {
		this.environment = environment;
		this.document = environment.document || globalThis.document;
		this.jumpHost = jumpHost;
		this.joystick = joystick;
		this.keys = new Set();
		this.jumpRequested = false;
		this.resetReason = 'initial';
		this.onKeyDown = event => this.handleKeyDown(event);
		this.onKeyUp = event => this.handleKeyUp(event);
		this.onBlur = () => this.reset('blur');
		this.onPageHide = () => this.reset('pagehide');
		this.onVisibility = () => {
			if (this.document?.hidden) this.reset('hidden');
		};
		this.onJump = event => this.requestJump(event);
		this.install();
	}

	axis() {
		return minimalMeadowInputAxis(
			this.keys,
			this.joystick?.vector
		);
	}

	consumeJump() {
		const requested = this.jumpRequested;
		this.jumpRequested = false;
		return requested;
	}

	runRequested() {
		return this.keys.has('ShiftLeft')
			|| this.keys.has('ShiftRight');
	}

	handleKeyDown(event) {
		if (minimalMeadowInputIsTextEntry(event.target)) return;
		if (MINIMAL_MEADOW_CONTROL_CODES.has(event.code)) {
			event.preventDefault?.();
		}
		this.keys.add(event.code);
		if (event.code === 'Space'
			&& !event.repeat
			&& !event.shiftKey) {
			this.jumpRequested = true;
		}
	}

	handleKeyUp(event) {
		if (MINIMAL_MEADOW_CONTROL_CODES.has(event.code)) {
			event.preventDefault?.();
		}
		this.keys.delete(event.code);
	}

	requestJump(event) {
		event?.preventDefault?.();
		this.jumpRequested = true;
	}

	reset(reason = 'manual') {
		this.keys.clear();
		this.jumpRequested = false;
		this.joystick?.reset?.();
		this.resetReason = reason;
	}

	install() {
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
		this.environment.addEventListener?.('blur', this.onBlur);
		this.environment.addEventListener?.('pagehide', this.onPageHide);
		this.document?.addEventListener?.(
			'visibilitychange',
			this.onVisibility
		);
		this.jumpHost?.addEventListener?.('pointerdown', this.onJump);
	}

	dispose() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.environment.removeEventListener?.('keyup', this.onKeyUp);
		this.environment.removeEventListener?.('blur', this.onBlur);
		this.environment.removeEventListener?.('pagehide', this.onPageHide);
		this.document?.removeEventListener?.(
			'visibilitychange',
			this.onVisibility
		);
		this.jumpHost?.removeEventListener?.('pointerdown', this.onJump);
		this.joystick?.destroy?.();
	}
}
