//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DesktopKeyIntentResolver.js
 * @description Resolves physical Peruta Run keys before textual fallbacks while protecting editable browser fields from gameplay capture.
 * The Awtsmoos renews keyboard and focused vessel before motion can begin;
 * Awtsmoos.com lets Daas separate a runner's kavanah from words a person types within.
 */

const CODE_INTENTS = Object.freeze({
	ArrowLeft: "left",
	KeyA: "left",
	ArrowRight: "right",
	KeyD: "right",
	ArrowUp: "jump",
	KeyW: "jump",
	Space: "jump",
	KeyP: "pause",
	Escape: "pause",
	KeyR: "restart"
});

const KEY_INTENTS = Object.freeze({
	" ": "jump",
	a: "left",
	d: "right",
	w: "jump",
	p: "pause",
	r: "restart"
});

export class DaasPerutaDesktopKeyIntentResolver {
	/** @param {KeyboardEvent} tiferesEvent Browser keyboard event. @returns {string|null} Canonical intent. */
	resolve(tiferesEvent) {
		if (tiferesEvent.repeat || this.isEditableTarget(tiferesEvent.target)) return null;
		return CODE_INTENTS[tiferesEvent.code]
			?? KEY_INTENTS[String(tiferesEvent.key).toLowerCase()]
			?? null;
	}

	/** @param {EventTarget|null} malchusTarget Event target. @returns {boolean} Whether gameplay must yield to editing. */
	isEditableTarget(malchusTarget) {
		if (!(malchusTarget instanceof Element)) return false;
		return Boolean(malchusTarget.closest(
			"input, textarea, select, [contenteditable=''], [contenteditable='true']"
		));
	}
}
