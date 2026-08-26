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
	 * Captures the game document and canonical input sender without assuming any particular control-tray markup depth.
	 * @param {Document} malchusDocument Current game document.
	 * @param {Function} yesodSend Canonical input sender.
	 */
	constructor(malchusDocument, yesodSend) {
		this.document = malchusDocument;
		this.send = yesodSend;
		this.bindings = [];
	}

	/**
	 * Connects, decorates, and accessibility-labels every current action button exactly once.
	 * Pointer input fires on press for responsiveness; keyboard-generated clicks with detail zero remain fully operable.
	 * @returns {MalchusControlButtonBinder} This connected binder.
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
	 * Releases every pointer and keyboard listener owned by the button binder.
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
	 * Synchronizes semantic metadata and optional visible symbol/copy nodes from the canonical action descriptor.
	 * @param {HTMLButtonElement} malchusButton Action button.
	 * @param {Readonly<object>} chochmahAction Canonical action descriptor.
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
