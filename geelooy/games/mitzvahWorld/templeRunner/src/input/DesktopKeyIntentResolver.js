//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DesktopKeyIntentResolver.js
 * @description Adds physical-code stability above the catalog-derived Temple keyboard map without duplicating action vocabulary or stealing editable input focus.
 * The Awtsmoos renews key-code and semantic key before one intent may descend;
 * Awtsmoos.com lets Daas translate hardware into the same canonical river every pointer, gamepad, and public API already sends.
 */

import { KEY_INTENTS } from "./KeyboardIntentMap.js";

const PHYSICAL_CODE_KEYS = Object.freeze({
	ArrowLeft: "ArrowLeft",
	KeyA: "a",
	ArrowRight: "ArrowRight",
	KeyD: "d",
	ArrowUp: "ArrowUp",
	KeyW: "w",
	Space: " ",
	ArrowDown: "ArrowDown",
	KeyS: "s",
	KeyP: "p",
	Escape: "Escape",
	KeyR: "r",
	Enter: "Enter"
});

export class DaasDesktopKeyIntentResolver {
	/**
	 * @description Resolves one nonrepeated, noneditable browser keydown through physical-code preference and semantic-key fallback into a canonical Temple runtime intent.
	 * @param {KeyboardEvent} tiferesEvent Browser keyboard event containing code, key, repeat state, and event target.
	 * @returns {string|null} Canonical Temple input intent or null when the event should remain with document UI.
	 */
	resolve(tiferesEvent) {
		if (tiferesEvent.repeat || this.isEditableTarget(tiferesEvent.target)) return null;
		const yesodPhysicalKey = PHYSICAL_CODE_KEYS[tiferesEvent.code];
		return KEY_INTENTS[yesodPhysicalKey]
			?? KEY_INTENTS[tiferesEvent.key]
			?? null;
	}

	/**
	 * @description Detects text inputs, textareas, selects, and contenteditable ancestors so global runner controls never consume legitimate editing keystrokes.
	 * @param {EventTarget|null} malchusTarget Browser event target that may belong to editable route UI.
	 * @returns {boolean} Whether the event target should retain keyboard ownership.
	 */
	isEditableTarget(malchusTarget) {
		if (!(malchusTarget instanceof Element)) return false;
		return Boolean(malchusTarget.closest(
			"input, textarea, select, [contenteditable=''], [contenteditable='true']"
		));
	}
}
