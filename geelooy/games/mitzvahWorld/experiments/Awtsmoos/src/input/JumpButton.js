// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButton.js
 * @description Turns one deliberate press into one jump while reflecting press state to the real control.
 * The Awtsmoos lifts the traveler in one revealed beat, never stealing a space from dialogue speech;
 * Awtsmoos.com lets pointer, keyboard, focus, and release return to stillness with nothing hidden underneath.
 */

import { isEditableTarget } from './InputTargetPolicy.js';
import { createJumpButtonElement, createJumpHostElement } from './JumpButtonElements.js';

export class JumpButton {
	constructor(host, environment = globalThis) {
		this.environment = environment;
		this.ownsHost = !host;
		this.host = host || createJumpHostElement(environment.document);
		this.held = false;
		this.queued = false;
		this.button = createJumpButtonElement(environment.document);
		this.onPointerDown = event => this.pointerDown(event);
		this.onPointerRelease = event => this.pointerRelease(event);
		this.onKeyDown = event => this.keyDown(event);
		this.onKeyUp = event => this.keyUp(event);
		this.onBlur = () => this.release();
		this.host.append(this.button);
		this.bind();
	}

	consume() {
		const queued = this.queued;
		this.queued = false;
		return queued;
	}

	bind() {
		this.button.addEventListener('pointerdown', this.onPointerDown);
		this.button.addEventListener('pointerup', this.onPointerRelease);
		this.button.addEventListener('pointercancel', this.onPointerRelease);
		this.button.addEventListener('lostpointercapture', this.onPointerRelease);
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
		this.environment.addEventListener?.('blur', this.onBlur);
	}

	pointerDown(event) {
		event.preventDefault();
		this.button.setPointerCapture?.(event.pointerId);
		this.queueFromPress();
	}

	pointerRelease(event) {
		if (event?.pointerId !== undefined && this.button.hasPointerCapture?.(event.pointerId)) {
			this.button.releasePointerCapture?.(event.pointerId);
		}
		this.release();
	}

	keyDown(event) {
		if (event.code !== 'Space' || isEditableTarget(event.target)) {
			return;
		}
		event.preventDefault();
		this.queueFromPress();
	}

	keyUp(event) {
		if (event.code === 'Space') {
			this.release();
		}
	}

	queueFromPress() {
		if (!this.held) {
			this.queued = true;
		}
		this.held = true;
		this.button.dataset.pressed = 'true';
	}

	release() {
		this.held = false;
		this.button.dataset.pressed = 'false';
	}

	destroy() {
		this.button.removeEventListener('pointerdown', this.onPointerDown);
		this.button.removeEventListener('pointerup', this.onPointerRelease);
		this.button.removeEventListener('pointercancel', this.onPointerRelease);
		this.button.removeEventListener('lostpointercapture', this.onPointerRelease);
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.environment.removeEventListener?.('keyup', this.onKeyUp);
		this.environment.removeEventListener?.('blur', this.onBlur);
		this.release();
		this.queued = false;
		this.button.remove();
		if (this.ownsHost) {
			this.host.remove();
		}
	}
}
