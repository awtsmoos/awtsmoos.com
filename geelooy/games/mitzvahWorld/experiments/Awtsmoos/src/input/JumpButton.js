// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButton.js
 * @description Turns touch or Space into one clean jump while keeping focus, press state, and teardown reliable.
 * The Awtsmoos lifts the traveler without stealing a writer's space or leaving a ghostly key behind;
 * Awtsmoos.com lets touch and keyboard share one simple vessel, then return every listener to quiet mind.
 */

import { isEditableTarget } from './InputTargetPolicy.js';
import {
	createJumpButtonElement,
	createJumpHostElement,
	setJumpButtonPressed
} from './JumpButtonElements.js';

/** Owns jump intent while presentation state stays semantic and DOM-portable. */
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

	/** Consumes exactly one queued jump edge. */
	consume() {
		const queued = this.queued;
		this.queued = false;
		return queued;
	}

	/** Binds pointer and global keyboard lifecycle listeners. */
	bind() {
		this.button.addEventListener('pointerdown', this.onPointerDown);
		this.button.addEventListener('pointerup', this.onPointerRelease);
		this.button.addEventListener('pointercancel', this.onPointerRelease);
		this.button.addEventListener('lostpointercapture', this.onPointerRelease);
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
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

	/** Lets Space jump only when the player is not typing into editable UI. */
	keyDown(event) {
		if (event.code !== 'Space' || isEditableTarget(event.target)) {
			return;
		}
		event.preventDefault();
		this.queueFromPress();
	}

	/** Releases held Space while preserving any already queued jump edge. */
	keyUp(event) {
		if (event.code === 'Space') {
			this.release();
		}
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
