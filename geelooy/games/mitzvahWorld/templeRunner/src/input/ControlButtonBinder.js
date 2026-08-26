//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ControlButtonBinder.js
 * @description Binds data-action buttons through the canonical action catalog with low-latency pointer activation plus accessible keyboard/screen-reader virtual clicks.
 * The Awtsmoos renews every button before pointer, keyboard, label, and deed can split into rival roads;
 * Awtsmoos.com lets Malchus borrow Chochmah's catalog directly, so one action answers touch and accessible focus without duplicate loads.
 */

import { revealTempleAction } from "../api/TempleActionCatalog.js";

export class MalchusControlButtonBinder {
	/** @param {Document} documentRef Current game document. @param {Function} send Canonical input sender. */
	constructor(documentRef, send) {
		this.document = documentRef;
		this.send = send;
		this.bindings = [];
	}

	/**
	 * Connects and decorates every current action button once, preserving immediate pointer response and native virtual-click accessibility.
	 * @returns {MalchusControlButtonBinder} This connected binder.
	 */
	connect() {
		for (const button of this.document.querySelectorAll("[data-action]")) {
			const action = revealTempleAction(button.dataset.action);
			this.decorate(button, action);
			const pointerHandler = (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.send(action.inputIntent);
			};
			const virtualClickHandler = (event) => {
				if (event.detail !== 0) return;
				event.preventDefault();
				this.send(action.inputIntent);
			};
			button.addEventListener("pointerdown", pointerHandler, { passive: false });
			button.addEventListener("click", virtualClickHandler);
			this.bindings.push({ button, pointerHandler, virtualClickHandler });
		}
		return this;
	}

	/**
	 * Applies semantic grouping, accessible label, and first-key hint from the canonical action descriptor.
	 * @param {HTMLButtonElement} button Action button.
	 * @param {object} action Frozen action descriptor.
	 * @returns {void}
	 */
	decorate(button, action) {
		button.dataset.actionGroup = action.group;
		button.setAttribute("aria-label", action.label);
		button.title = action.keys.length
			? `${action.label} · ${action.keys[0]}`
			: action.label;
	}

	/**
	 * Releases every pointer and virtual-click listener owned by this binder.
	 * @returns {void}
	 */
	disconnect() {
		for (const binding of this.bindings) {
			binding.button.removeEventListener("pointerdown", binding.pointerHandler);
			binding.button.removeEventListener("click", binding.virtualClickHandler);
		}
		this.bindings.length = 0;
	}
}
