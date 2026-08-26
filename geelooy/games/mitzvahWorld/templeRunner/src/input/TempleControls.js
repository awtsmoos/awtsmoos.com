//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleControls.js
 * @description Orchestrates layout-safe keyboard, swipe, and explicit buttons behind one detachable canonical intent stream.
 * The Awtsmoos renews key, fingertip, and button while Yesod joins them into one simple deed;
 * Awtsmoos.com keeps each browser vessel separate, so controls stay fast, optional, and easy to read.
 */

import { MalchusControlButtonBinder } from "./ControlButtonBinder.js";
import { DaasDesktopKeyIntentResolver } from "./DesktopKeyIntentResolver.js";
import { YesodPointerSwipeControls } from "./PointerSwipeControls.js";

export class TempleControls {
	/**
	 * @param {Document} documentRef Game document.
	 * @param {HTMLCanvasElement} canvas Native canvas.
	 * @param {object} input Shared intent queue.
	 * @param {object} feedback Tiferes feedback controller.
	 */
	constructor(documentRef, canvas, input, feedback) {
		this.input = input;
		this.feedback = feedback;
		this.keyboard = new DaasDesktopKeyIntentResolver();
		this.boundKeyDown = (event) => this.onKeyDown(event);
		this.send = (intent) => this.sendIntent(intent);
		this.pointer = new YesodPointerSwipeControls(
			canvas,
			this.send,
			() => this.feedback.awaken()
		);
		this.buttons = new MalchusControlButtonBinder(documentRef, this.send);
	}

	/** Connects every input vessel. @returns {TempleControls} */
	connect() {
		window.addEventListener("keydown", this.boundKeyDown, { passive: false });
		this.pointer.connect();
		this.buttons.connect();
		return this;
	}

	/** Releases every listener owned by this control composition. */
	disconnect() {
		window.removeEventListener("keydown", this.boundKeyDown);
		this.pointer.disconnect();
		this.buttons.disconnect();
	}

	/** @param {string} intent Canonical action. */
	sendIntent(intent) {
		this.feedback.awaken();
		this.input.request(intent);
	}

	/** @param {KeyboardEvent} event Keyboard input. */
	onKeyDown(event) {
		const intent = this.keyboard.resolve(event);
		if (!intent) return;
		event.preventDefault();
		this.sendIntent(intent);
	}
}
