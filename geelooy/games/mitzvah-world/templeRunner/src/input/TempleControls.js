//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleControls.js
 * @description Orchestrates keyboard, swipe, and explicit action buttons behind one detachable canonical intent stream while each device adapter keeps independent ownership.
 * The Awtsmoos renews key, fingertip, and button while Yesod joins them into one simple deed;
 * Awtsmoos.com keeps every browser vessel separate, so control remains fast and unified without one monolith swallowing the player's need.
 */

import { MalchusControlButtonBinder } from "./ControlButtonBinder.js";
import { DaasDesktopKeyIntentResolver } from "./DesktopKeyIntentResolver.js";
import { YesodPointerSwipeControls } from "./PointerSwipeControls.js";

export class TempleControls {
	/**
	 * @description Composes keyboard, pointer-swipe, and visible-button adapters around one shared intent queue and feedback awakener without connecting listeners until requested.
	 * @param {Document} documentRef Current game document used to discover explicit action buttons.
	 * @param {HTMLCanvasElement} canvas Native game canvas receiving pointer swipes.
	 * @param {object} input Shared frame-scoped intent queue exposing `request()`.
	 * @param {object} feedback Tiferes feedback controller exposing `awaken()`.
	 * @returns {void}
	 */
	constructor(documentRef, canvas, input, feedback) {
		this.input = input;
		this.feedback = feedback;
		this.keyboard = new DaasDesktopKeyIntentResolver();
		this.boundKeyDown = (event) => this.onKeyDown(event);
		this.send = (intent) => this.sendIntent(intent);
		this.pointer = new YesodPointerSwipeControls(canvas, this.send, () => this.feedback.awaken());
		this.buttons = new MalchusControlButtonBinder(documentRef, this.send);
	}

	/**
	 * @description Connects global keyboard plus route-local pointer/button adapters exactly once through their stable callback identities.
	 * @returns {TempleControls} This connected control composition for fluent runtime assembly.
	 */
	connect() {
		window.addEventListener("keydown", this.boundKeyDown, { passive: false });
		this.pointer.connect();
		this.buttons.connect();
		return this;
	}

	/**
	 * @description Removes every listener owned by the control composition while leaving unrelated runtime/document handlers untouched.
	 * @returns {void}
	 */
	disconnect() {
		window.removeEventListener("keydown", this.boundKeyDown);
		this.pointer.disconnect();
		this.buttons.disconnect();
	}

	/**
	 * @description Awakens feedback and forwards one canonical runtime intent into the shared frame queue from any device adapter.
	 * @param {string} intent Canonical runtime intention resolved from keyboard, swipe, or action catalog.
	 * @returns {void}
	 */
	sendIntent(intent) {
		this.feedback.awaken();
		this.input.request(intent);
	}

	/**
	 * @description Resolves one browser key event through editable-safe desktop policy, preventing default behavior only when a gameplay intent is actually consumed.
	 * @param {KeyboardEvent} event Browser keydown event.
	 * @returns {void}
	 */
	onKeyDown(event) {
		const intent = this.keyboard.resolve(event);
		if (!intent) return;
		event.preventDefault();
		this.sendIntent(intent);
	}
}
