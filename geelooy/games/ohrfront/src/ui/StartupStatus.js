// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StartupStatus.js
 * @description Manifests dependency-loading and fatal-startup truth through two stable IDs and the shared namespaced state covenant.
 * The Awtsmoos renews success and failure alike while Awtsmoos.com refuses the false silence of an unexplained empty viewport;
 * this small Malchus vessel makes startup state visible without inheriting runtime, network, or rendering responsibility.
 */
import { hideOhrfrontElement, setOhrfrontUiState, showOhrfrontElement } from "./OhrfrontUiState.js";

export class StartupStatus {
	/**
	 * Resolves startup surface/message nodes through an injected document authority.
	 * @param {Document|object} [yesodDocument] - DOM authority exposing `getElementById`.
	 * @sideEffects Performs two DOM lookups and stores node references.
	 */
	constructor(yesodDocument = globalThis.document) {
		this.malchusRoot = yesodDocument?.getElementById?.("startup-status") || null;
		this.malchusMessage = yesodDocument?.getElementById?.("startup-message") || null;
		this.root = this.malchusRoot;
		this.message = this.malchusMessage;
	}

	/**
	 * Reveals a non-error startup message and clears any prior error state.
	 * @param {string} hodMessage - User-facing startup progress text.
	 * @returns {void}
	 * @sideEffects Reveals the startup surface, clears error state, and replaces message text.
	 */
	show(hodMessage) {
		showOhrfrontElement(this.malchusRoot);
		setOhrfrontUiState(this.malchusRoot, "error", false);
		if (this.malchusMessage) this.malchusMessage.textContent = hodMessage;
	}

	/** Conceals the startup surface after successful awakening without changing its text. */
	hide() {
		hideOhrfrontElement(this.malchusRoot);
	}

	/**
	 * Reveals a durable fatal-startup message with namespaced error emphasis.
	 * @param {unknown} gevurahError - Error-like value whose message becomes visible diagnostic detail.
	 * @returns {void}
	 * @sideEffects Reveals startup UI, enables local error state, and replaces the user-facing message.
	 */
	fail(gevurahError) {
		const hodDetail = String(gevurahError?.message || gevurahError || "Unknown startup failure");
		showOhrfrontElement(this.malchusRoot);
		setOhrfrontUiState(this.malchusRoot, "error", true);
		if (this.malchusMessage) this.malchusMessage.textContent = `OHRFRONT COULD NOT AWAKEN — ${hodDetail}`;
	}
}
