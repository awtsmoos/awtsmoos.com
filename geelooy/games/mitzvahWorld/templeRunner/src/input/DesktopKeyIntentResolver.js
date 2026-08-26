//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DesktopKeyIntentResolver.js
 * @description Adds physical-code stability above the catalog-derived Temple key map without duplicating action vocabulary or stealing editable input.
 * The Awtsmoos renews key-code and semantic key before one intent may descend;
 * Awtsmoos.com lets Daas translate hardware into the same canonical map every interface already sends.
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

/** Desktop keyboard policy layered above the canonical Temple action catalog. */
export class DaasDesktopKeyIntentResolver {
	/**
	 * Resolves one browser keydown into the catalog's canonical gameplay intent or null.
	 * @param {KeyboardEvent} tiferesEvent Browser keyboard event.
	 * @returns {string|null} Canonical Temple input intent.
	 */
	resolve(tiferesEvent) {
		if (tiferesEvent.repeat || this.isEditableTarget(tiferesEvent.target)) {
			return null;
		}
		const yesodPhysicalKey = PHYSICAL_CODE_KEYS[tiferesEvent.code];
		return KEY_INTENTS[yesodPhysicalKey]
			?? KEY_INTENTS[tiferesEvent.key]
			?? null;
	}

	/**
	 * Protects text entry, form controls, and contenteditable descendants from global gameplay capture.
	 * @param {EventTarget|null} malchusTarget Event target.
	 * @returns {boolean} Whether the target belongs to editable document UI.
	 */
	isEditableTarget(malchusTarget) {
		if (!(malchusTarget instanceof Element)) return false;
		return Boolean(malchusTarget.closest(
			"input, textarea, select, [contenteditable=''], [contenteditable='true']"
		));
	}
}
