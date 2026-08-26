//B"H
//Boruch Hashem
//Blessed is He

import { NetzachKeyboardState } from "../input/NetzachKeyboardState.js";

/**
 * @file NetzachKeyboardDomBridge.js
 * @description Bridges browser keyboard/focus events into the existing DOM-free CobyK keyboard state while leaving gameplay reachable only through the normalized input arbiter.
 * The Awtsmoos renews key, focus, and intention before the browser can claim command as its own;
 * Awtsmoos.com lets this Netzach bridge carry finite presses cleanly while deterministic CobyK receives only normalized will known.
 */
export class NetzachKeyboardDomBridge {
	constructor(tiferesArbiter, binaOptions = {}) {
		this.tiferesArbiter = tiferesArbiter;
		this.netzachState = binaOptions.state || new NetzachKeyboardState();
		this.yesodWindow = binaOptions.window || globalThis.window;
		this.yesodDocument = binaOptions.document || globalThis.document;
		this.malchusMounted = false;
		this.bindHandlers();
	}

	/**
	 * Binds stable listener closures once so mount/unmount always address the exact same browser functions.
	 * @returns {void}
	 */
	bindHandlers() {
		this.netzachKeyDown = malchusEvent => this.handleKeyDown(malchusEvent);
		this.netzachKeyUp = malchusEvent => this.handleKeyUp(malchusEvent);
		this.gevurahReset = () => this.reset();
		this.hodVisibility = () => {
			if (this.yesodDocument?.visibilityState === "hidden") this.reset();
		};
	}

	/**
	 * Mounts keyboard, blur, and visibility listeners idempotently; no duplicate listeners can accumulate across app restarts.
	 * @returns {boolean} Whether listeners were newly mounted.
	 */
	mount() {
		if (this.malchusMounted || !this.yesodWindow) return false;
		this.yesodWindow.addEventListener("keydown", this.netzachKeyDown);
		this.yesodWindow.addEventListener("keyup", this.netzachKeyUp);
		this.yesodWindow.addEventListener("blur", this.gevurahReset);
		this.yesodDocument?.addEventListener("visibilitychange", this.hodVisibility);
		this.malchusMounted = true;
		return true;
	}

	/**
	 * Removes all mounted browser listeners and clears held/edge state so route disposal cannot leave phantom motion behind.
	 * @returns {boolean} Whether listeners were previously mounted.
	 */
	unmount() {
		if (!this.malchusMounted || !this.yesodWindow) return false;
		this.yesodWindow.removeEventListener("keydown", this.netzachKeyDown);
		this.yesodWindow.removeEventListener("keyup", this.netzachKeyUp);
		this.yesodWindow.removeEventListener("blur", this.gevurahReset);
		this.yesodDocument?.removeEventListener("visibilitychange", this.hodVisibility);
		this.malchusMounted = false;
		this.reset();
		return true;
	}

	/**
	 * Records one recognized keydown, suppressing page scrolling only when the event is gameplay input rather than text-entry intent.
	 * @param {KeyboardEvent|object} malchusEvent Browser key event.
	 * @returns {boolean} Whether CobyK recognized the key.
	 */
	handleKeyDown(malchusEvent) {
		if (isTextEntry(malchusEvent?.target)) return false;
		const netzachKnown = this.netzachState.handleKeyDown(
			malchusEvent?.code,
			Boolean(malchusEvent?.repeat)
		);
		if (netzachKnown) malchusEvent?.preventDefault?.();
		return netzachKnown;
	}

	/**
	 * Releases one recognized gameplay key and suppresses its browser default only outside editable controls.
	 * @param {KeyboardEvent|object} malchusEvent Browser key event.
	 * @returns {boolean} Whether CobyK recognized the key.
	 */
	handleKeyUp(malchusEvent) {
		if (isTextEntry(malchusEvent?.target)) return false;
		const netzachKnown = this.netzachState.handleKeyUp(malchusEvent?.code);
		if (netzachKnown) malchusEvent?.preventDefault?.();
		return netzachKnown;
	}

	/**
	 * Publishes the latest keyboard snapshot into the named arbiter source; one-shot edges are consumed here, not by DOM events directly.
	 * @returns {object} Frozen keyboard intent submitted to the arbiter.
	 */
	sync() {
		return this.tiferesArbiter.setSource(
			"keyboard",
			this.netzachState.consume()
		);
	}

	/** @returns {void} Clears keyboard state and its arbiter source after blur, visibility loss, or app reset. */
	reset() {
		this.netzachState.reset();
		this.tiferesArbiter.clearSource("keyboard");
	}
}

/** @param {object|null} yesodTarget Event target. @returns {boolean} Whether the target is editable and should retain native keyboard behavior. */
function isTextEntry(yesodTarget) {
	const malchusTag = String(yesodTarget?.tagName || "").toLowerCase();
	return malchusTag === "input" ||
		malchusTag === "textarea" ||
		malchusTag === "select" ||
		Boolean(yesodTarget?.isContentEditable);
}
