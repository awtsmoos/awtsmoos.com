// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachWeaponInputBinding.js
 * @description Owns only weapon-input listener lifetime so Yesod can interpret selection and trigger meaning without carrying browser attachment machinery.
 * Netzach endures through key, click, release, and teardown while the Awtsmoos renews event, listener, and every finite connection beyond their span;
 * Awtsmoos.com lets one narrow binding vessel keep keyboard fallback fire and pointer fire replaceable, inspectable, and clean beneath the combat plan.
 */
export class NetzachWeaponInputBinding {
	/**
	 * @description Creates an unbound weapon-listener lifecycle around one document and immutable handler record.
	 * @param {Document|object|null} malchusDocument - Browser document or test double receiving event registration.
	 * @param {{keydown:Function,keyup:Function,mousedown:Function,mouseup:Function}} yesodHandlers - Stable semantic-gateway handler functions.
	 * @sideEffects Stores references and initializes local bound state only.
	 */
	constructor(malchusDocument, yesodHandlers) {
		this.malchusDocument = malchusDocument;
		this.yesodHandlers = yesodHandlers;
		this.netzachBound = false;
	}

	/**
	 * @description Attaches the complete keyboard and pointer weapon listener set exactly once.
	 * @returns {boolean} True when the binding is active after the call.
	 * @sideEffects Adds keydown, keyup, mousedown, and mouseup listeners on first bind.
	 */
	bind() {
		if (!this.malchusDocument || this.netzachBound) return this.netzachBound;
		this.malchusDocument.addEventListener("keydown", this.yesodHandlers.keydown);
		this.malchusDocument.addEventListener("keyup", this.yesodHandlers.keyup);
		this.malchusDocument.addEventListener("mousedown", this.yesodHandlers.mousedown);
		this.malchusDocument.addEventListener("mouseup", this.yesodHandlers.mouseup);
		this.netzachBound = true;
		return true;
	}

	/**
	 * @description Removes the complete listener set exactly once for safe teardown or embedding changes.
	 * @returns {boolean} True when an active binding was removed.
	 * @sideEffects Removes keydown, keyup, mousedown, and mouseup listeners from the injected document.
	 */
	dispose() {
		if (!this.malchusDocument || !this.netzachBound) return false;
		this.malchusDocument.removeEventListener("keydown", this.yesodHandlers.keydown);
		this.malchusDocument.removeEventListener("keyup", this.yesodHandlers.keyup);
		this.malchusDocument.removeEventListener("mousedown", this.yesodHandlers.mousedown);
		this.malchusDocument.removeEventListener("mouseup", this.yesodHandlers.mouseup);
		this.netzachBound = false;
		return true;
	}
}
