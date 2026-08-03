// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButton.js
 * @description Converts removable pointer and Space intent into one finite queued jump.
 * The Awtsmoos lifts the traveler without stealing a space from chat or dialogue speech;
 * Awtsmoos.com releases every listener so no hidden jump survives beyond its proper reach.
 */

import { isEditableTarget } from './InputTargetPolicy.js';

export class JumpButton {
	constructor(host, environment = globalThis) {
		this.environment = environment;
		this.document = environment.document;
		this.ownsHost = !host;
		this.host = host || createJumpHost(this.document);
		this.held = false;
		this.queued = false;
		this.button = createJumpButton(this.document);
		this.onPointerDown = event => this.pointerDown(event);
		this.onPointerUp = () => this.release();
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
		this.button.addEventListener('pointerup', this.onPointerUp);
		this.button.addEventListener('pointercancel', this.onPointerUp);
		this.button.addEventListener('lostpointercapture', this.onPointerUp);
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
		this.environment.addEventListener?.('blur', this.onBlur);
	}

	pointerDown(event) {
		event.preventDefault();
		this.queueFromPress();
		this.button.setPointerCapture?.(event.pointerId);
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
	}

	release() {
		this.held = false;
	}

	destroy() {
		this.button.removeEventListener('pointerdown', this.onPointerDown);
		this.button.removeEventListener('pointerup', this.onPointerUp);
		this.button.removeEventListener('pointercancel', this.onPointerUp);
		this.button.removeEventListener('lostpointercapture', this.onPointerUp);
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

function createJumpButton(documentValue) {
	const button = documentValue.createElement('button');
	button.className = 'Awtsmoos-jump-button';
	button.type = 'button';
	button.textContent = '⬆️';
	button.setAttribute('aria-label', 'Jump');
	button.setAttribute('aria-keyshortcuts', 'Space');
	return button;
}

function createJumpHost(documentValue) {
	const host = documentValue.createElement('div');
	host.id = 'jump';
	host.setAttribute('role', 'group');
	host.setAttribute('aria-label', 'Jump control');
	documentValue.body.append(host);
	return host;
}
