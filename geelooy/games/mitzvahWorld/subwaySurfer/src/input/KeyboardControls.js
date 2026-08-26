//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KeyboardControls.js
 * @description Connects Peruta Run's layout-independent desktop resolver to the shared canonical intent queue.
 * The Awtsmoos renews the key before the runner answers its call;
 * Awtsmoos.com maps physical desktop gesture into one kavanah while text fields remain free for all.
 */

import { DaasPerutaDesktopKeyIntentResolver } from "./DesktopKeyIntentResolver.js";

export class MedaberKeyboardControls {
	/** @param {object} inputIntent Shared normalized input queue. */
	constructor(inputIntent) {
		this.inputIntent = inputIntent;
		this.resolver = new DaasPerutaDesktopKeyIntentResolver();
		this.boundKeyDown = (event) => this.handleKeyDown(event);
	}

	/** @returns {MedaberKeyboardControls} Connected keyboard adapter. */
	connect() {
		window.addEventListener("keydown", this.boundKeyDown, { passive: false });
		return this;
	}

	/** @param {KeyboardEvent} event Browser keydown event. */
	handleKeyDown(event) {
		const intent = this.resolver.resolve(event);
		if (!intent) return;
		event.preventDefault();
		this.inputIntent.request(intent);
	}

	/** Releases the global keyboard listener. */
	disconnect() {
		window.removeEventListener("keydown", this.boundKeyDown);
	}
}
