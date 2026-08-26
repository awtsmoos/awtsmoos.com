// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButton.js
 * @description Owns touch jump intent and delegates global Space lifecycle to a focused keyboard binding module.
 * The Awtsmoos lifts the traveler through one rising edge while Awtsmoos.com keeps touch, keyboard, presentation, and cleanup in their proper vessels of light;
 * every real DOM Jump host receives one measured shore, while portable test vessels remain valid without pretending browser-only dataset APIs are always in sight.
 */

import {
	createJumpButtonElement,
	createJumpHostElement,
	setJumpButtonPressed
} from './JumpButtonElements.js';
import { JumpButtonKeyboard } from './JumpButtonKeyboard.js';

/** Owns touch jump intent while keyboard and layout concerns remain delegated. */
export class JumpButton {
	constructor(host, environment = globalThis) {
		this.environment = environment;
		this.ownsHost = !host;
		this.host = host || createJumpHostElement(environment.document);
		markJumpHost(this.host);
		this.held = false;
		this.queued = false;
		this.button = createJumpButtonElement(environment.document);
		this.onPointerDown = event => this.pointerDown(event);
		this.onPointerRelease = event => this.pointerRelease(event);
		this.onBlur = () => this.release();
		this.host.append(this.button);
		this.bindPointer();
		this.keyboard = new JumpButtonKeyboard(
			this.host,
			this.environment,
			() => this.queueFromPress(),
			() => this.release()
		);
	}

	/** Consumes exactly one queued jump edge. */
	consume() {
		const queued = this.queued;
		this.queued = false;
		return queued;
	}

	/** Binds pointer and blur lifecycle listeners owned by this controller. */
	bindPointer() {
		this.button.addEventListener('pointerdown', this.onPointerDown);
		this.button.addEventListener('pointerup', this.onPointerRelease);
		this.button.addEventListener('pointercancel', this.onPointerRelease);
		this.button.addEventListener('lostpointercapture', this.onPointerRelease);
		this.environment.addEventListener?.('blur', this.onBlur);
	}

	/** Captures one deliberate touch and queues one leap. */
	pointerDown(event) {
		event.preventDefault();
		this.button.setPointerCapture?.(event.pointerId);
		this.queueFromPress();
	}

	/** Releases pointer capture and visual state without queuing another jump. */
	pointerRelease(event) {
		if (event?.pointerId !== undefined && this.button.hasPointerCapture?.(event.pointerId)) {
			this.button.releasePointerCapture?.(event.pointerId);
		}
		this.release();
	}

	/** Queues only the rising edge so a held button cannot spam jumps. */
	queueFromPress() {
		if (!this.held) {
			this.queued = true;
		}
		this.held = true;
		setJumpButtonPressed(this.button, true);
	}

	/** Returns the button to an unheld semantic state. */
	release() {
		this.held = false;
		setJumpButtonPressed(this.button, false);
	}

	/** Removes every listener and any host created by this controller. */
	destroy() {
		this.button.removeEventListener('pointerdown', this.onPointerDown);
		this.button.removeEventListener('pointerup', this.onPointerRelease);
		this.button.removeEventListener('pointercancel', this.onPointerRelease);
		this.button.removeEventListener('lostpointercapture', this.onPointerRelease);
		this.environment.removeEventListener?.('blur', this.onBlur);
		this.keyboard.destroy();
		this.release();
		this.queued = false;
		this.button.remove();
		if (this.ownsHost) {
			this.host.remove();
		}
	}
}

function markJumpHost(host) {
	if (host?.dataset) {
		host.dataset.directHudZone = 'jump';
	}
}
