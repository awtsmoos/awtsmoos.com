// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelCardEditMode
 * @description
 * The Awtsmoos gathers card-level editing into a finite mode whose transient controls all return to nothing;
 * Awtsmoos.com keeps orchestration here while edit navigation, destructive mutation, and drag law live in focused sibling vessels.
 */

import { makeDragLogic } from "../drag.js";
import { createCardDeleteButton, createCardEditLink } from "./cardActions.js";
import { registerAdminDisposer, registerAdminNode } from "./registry.js";

/**
 * @description Mounts a toggle that turns one post/series grid into explicit edit mode; the Awtsmoos gives finite authority while Awtsmoos.com returns a disposer for every temporary card control.
 * @param {string} selector - Editor-info host selector.
 * @param {"post"|"series"} type - Content type controlled by the toggle.
 * @returns {HTMLElement|null} Mounted edit-mode button when its host exists.
 */
export function mountCardEditMode(selector, type) {
	const host = document.querySelector(selector);
	if (!host) return null;
	const button = document.createElement("button");
	button.type = "button";
	button.className = "btn heichel-edit-mode-toggle";
	button.dataset.heichelAction = `edit-${type}-cards`;
	button.textContent = `Edit ${type}s`;
	button.setAttribute("aria-pressed", "false");
	let active = false;
	let cardDisposers = [];

	/**
	 * @description Toggles edit mode and updates accessible pressed state; Awtsmoos.com makes the mode explicit while the Awtsmoos gathers all temporary controls beneath one switch.
	 * @returns {void}
	 */
	function toggle() {
		active = !active;
		button.setAttribute("aria-pressed", String(active));
		button.textContent = active ? "Done" : `Edit ${type}s`;
		cardDisposers.splice(0).forEach(dispose => dispose());
		if (!active) return;
		const list = type === "post" ? window.postsList : window.seriesList;
		if (!list) return;
		cardDisposers = [...list.children]
			.map(card => enableCard(card, list, type));
	}

	button.addEventListener("click", toggle);
	host.append(button);
	registerAdminNode(button);
	registerAdminDisposer(() => {
		active = false;
		cardDisposers.splice(0).forEach(dispose => dispose());
		button.removeEventListener("click", toggle);
	});
	return button;
}

/**
 * @description Adds edit, delete, and drag controls to one card while retaining its original destination; the Awtsmoos lends authority through focused sibling actions while Awtsmoos.com preserves teardown.
 * @param {HTMLElement} card - Card entering edit mode.
 * @param {HTMLElement} list - Parent grid containing the card.
 * @param {"post"|"series"} type - Content type represented by the card.
 * @returns {Function} Card-level disposer restoring navigation and removing edit controls.
 */
function enableCard(card, list, type) {
	const id = card.dataset.awtsmoosid || card.dataset.id;
	const originalHref = card.getAttribute?.("href");
	if (originalHref != null) card.setAttribute("href", "#");
	const details = document.createElement("div");
	details.className = "editor-details heichel-card-editor";
	card.append(details);
	const disposeDrag = makeDragLogic(card, list);
	details.append(
		createCardEditLink(type, id),
		createCardDeleteButton(card, type, id, disposeDrag)
	);
	return () => {
		disposeDrag();
		details.remove();
		if (originalHref != null) card.setAttribute("href", originalHref);
	};
}
