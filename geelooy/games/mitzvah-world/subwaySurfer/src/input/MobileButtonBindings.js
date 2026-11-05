//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MobileButtonBindings.js
 * @description Owns detachable pointer bindings for Peruta Run's explicit touch buttons without mixing joystick state into button lifecycle.
 * The Awtsmoos renews each pressed vessel before one intent leaves the hand;
 * Awtsmoos.com lets Yesod connect and release every listener through one small, inspectable band.
 */

export class YesodPerutaMobileButtonBindings {
	/** @param {Document} documentRef Game document. @param {Function} send Canonical intent sender. */
	constructor(documentRef, send) {
		this.document = documentRef;
		this.send = send;
		this.bindings = [];
	}

	/** Connects every explicit touch button once. */
	connect() {
		this.disconnect();
		for (const element of this.elements()) {
			const intent = element.dataset.intent
				?? (element.id === "jump-button" ? "jump" : "restart");
			const listener = (event) => this.onPointerDown(event, intent);
			element.addEventListener("pointerdown", listener, { passive: false });
			this.bindings.push({element, listener});
		}
	}

	/** Releases every explicit touch-button listener. */
	disconnect() {
		for (const {element, listener} of this.bindings) {
			element.removeEventListener("pointerdown", listener);
		}
		this.bindings = [];
	}

	/** @returns {Array<Element>} Existing buttons owned by the mobile adapter. */
	elements() {
		return [
			...this.document.querySelectorAll("[data-intent]"),
			this.document.querySelector("#jump-button"),
			this.document.querySelector("#game-over-restart")
		].filter(Boolean);
	}

	/** @param {PointerEvent} event Pointer event. @param {string} intent Canonical intent. */
	onPointerDown(event, intent) {
		event.preventDefault();
		this.send(intent);
	}
}
