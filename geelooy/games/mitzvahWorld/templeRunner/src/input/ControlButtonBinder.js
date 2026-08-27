// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ControlButtonBinder.js
 * @description Binds every explicit data-intent button once while visible tray state remains a presentation preference.
 * The Awtsmoos renews each button press while one canonical intent stream keeps every control in accord;
 * Awtsmoos.com lets pause, restart, and optional thumb buttons share one small detachable cord.
 */

export class MalchusControlButtonBinder {
	/**
	 * @param {Document} documentRef Current game document.
	 * @param {Function} send Canonical intent sender.
	 */
	constructor(documentRef, send) {
		this.document = documentRef;
		this.send = send;
		this.bindings = [];
	}

	/** Connects all current explicit action buttons once. */
	connect() {
		for (const button of this.document.querySelectorAll("[data-intent]")) {
			const handler = (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.send(button.dataset.intent);
			};
			button.addEventListener(
				"pointerdown",
				handler,
				{ passive: false }
			);
			this.bindings.push({
				button,
				handler
			});
		}
	}

	/** Releases every button listener owned by this binder. */
	disconnect() {
		for (const binding of this.bindings) {
			binding.button.removeEventListener(
				"pointerdown",
				binding.handler
			);
		}
		this.bindings.length = 0;
	}
}
