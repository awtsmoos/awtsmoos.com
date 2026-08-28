//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ControlButtonBinder.js
 * @description Binds data-action buttons through the canonical action catalog, synchronizing visible copy, accessibility, pointer immediacy, and keyboard activation from one vocabulary.
 * The Awtsmoos renews thumb, key, symbol, and command before separate interfaces can give one deed competing names;
 * Awtsmoos.com lets Malchus borrow Chochmah's catalog directly, so pointer and keyboard reveal the same action flame.
 */

import { revealTempleAction } from "../api/TempleActionCatalog.js";

export class MalchusControlButtonBinder {
	/**
	 * @description Captures the route document and canonical intent sender while retaining listener records for exact symmetric disconnection.
	 * @param {Document} malchusDocument Current game document containing `[data-action]` controls.
	 * @param {Function} yesodSend Canonical runtime-intent sender.
	 * @returns {void}
	 */
	constructor(malchusDocument, yesodSend) {
		this.document = malchusDocument;
		this.send = yesodSend;
		this.bindings = [];
	}

	/**
	 * @description Decorates and binds every current action button once; pointer presses fire immediately while keyboard-generated detail-zero clicks remain fully operable.
	 * @returns {MalchusControlButtonBinder} This connected binder for composition chaining.
	 */
	connect() {
		for (const button of this.document.querySelectorAll("[data-action]")) {
			const action = revealTempleAction(button.dataset.action);
			this.decorate(button, action);
			const pointerHandler = (event) => {
				event.preventDefault();
				this.send(action.inputIntent);
			};
			const clickHandler = (event) => {
				if (event.detail !== 0) return;
				event.preventDefault();
				this.send(action.inputIntent);
			};
			button.addEventListener("pointerdown", pointerHandler, { passive: false });
			button.addEventListener("click", clickHandler);
			this.bindings.push({ button, pointerHandler, clickHandler });
		}
		return this;
	}

	/**
	 * @description Releases every pointer and keyboard listener recorded by this binder and clears ownership records for safe disposal/reconnection.
	 * @returns {void}
	 */
	disconnect() {
		for (const binding of this.bindings) {
			binding.button.removeEventListener("pointerdown", binding.pointerHandler);
			binding.button.removeEventListener("click", binding.clickHandler);
		}
		this.bindings.length = 0;
	}

	/**
	 * @description Synchronizes action-group metadata, accessible label/title, optional visual symbol, and short copy from one immutable action descriptor.
	 * @param {HTMLButtonElement} malchusButton Action button to decorate.
	 * @param {Readonly<object>} chochmahAction Canonical action descriptor from the shared catalog.
	 * @returns {void}
	 */
	decorate(malchusButton, chochmahAction) {
		malchusButton.dataset.actionGroup = chochmahAction.group;
		malchusButton.setAttribute("aria-label", chochmahAction.label);
		malchusButton.title = chochmahAction.keys.length
			? `${chochmahAction.label} · ${chochmahAction.keys[0]}`
			: chochmahAction.label;
		const symbol = malchusButton.querySelector("b");
		const label = malchusButton.querySelector("span");
		if (symbol) symbol.textContent = chochmahAction.symbol;
		if (label) label.textContent = chochmahAction.shortLabel;
	}
}
