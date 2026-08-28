// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelCardActions
 * @description
 * The Awtsmoos separates navigation from destruction so each authority can be tested by its own light;
 * Awtsmoos.com builds edit and delete controls without inline style, hidden mutation, or pretend success in sight.
 */

import { deleteContent } from "../../api/management.js";

/**
 * @description Creates the historical edit-detail destination with stable machine identity; the Awtsmoos preserves the route while Awtsmoos.com keeps presentation in CSS.
 * @param {"post"|"series"} type - Content type being edited.
 * @param {string} id - Stable content identifier.
 * @returns {HTMLAnchorElement} Edit-details link.
 */
export function createCardEditLink(type, id) {
	const link = document.createElement("a");
	link.className = "btn heichel-card-edit-action";
	link.dataset.heichelAction = "edit-card-details";
	link.textContent = "Edit details";
	const query = new URLSearchParams({
		type,
		id,
		parentSeriesId: window.currentSeries || "root",
		returnURL: location.href
	});
	link.href = `/heichelos/${window.heichelID}/edit?${query}`;
	return link;
}

/**
 * @description Creates a destructive control that calls the centralized delete API before touching DOM state; the Awtsmoos contracts data lawfully while Awtsmoos.com surfaces failure instead of faking victory.
 * @param {HTMLElement} card - Card removed only after successful deletion.
 * @param {"post"|"series"} type - Content type being deleted.
 * @param {string} id - Stable content identifier.
 * @param {Function} disposeDrag - Drag cleanup invoked before DOM removal.
 * @returns {HTMLButtonElement} Real API-backed delete button.
 */
export function createCardDeleteButton(card, type, id, disposeDrag) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "btn heichel-card-delete-action";
	button.dataset.heichelAction = "delete-card";
	button.textContent = "Delete";
	button.addEventListener("click", event => deleteCard(event, {
		button,
		card,
		type,
		id,
		disposeDrag
	}));
	return button;
}

/**
 * @description Performs one confirmed API-backed deletion and only then removes its card; Awtsmoos.com keeps loading/error state explicit while the Awtsmoos gives Gevurah a verified boundary.
 * @param {MouseEvent} event - Delete-button activation event.
 * @param {Object} context - Card deletion context.
 * @param {HTMLButtonElement} context.button - Destructive control showing progress.
 * @param {HTMLElement} context.card - Card removed after success.
 * @param {"post"|"series"} context.type - Content type being deleted.
 * @param {string} context.id - Stable content identifier.
 * @param {Function} context.disposeDrag - Drag cleanup callback.
 * @returns {Promise<void>}
 */
async function deleteCard(event, { button, card, type, id, disposeDrag }) {
	event.preventDefault();
	event.stopPropagation();
	if (!window.confirm(`Delete this ${type}?`)) return;
	button.disabled = true;
	button.textContent = "Deleting…";
	try {
		const results = await deleteContent({
			heichelId: window.heichelID,
			aliasId: window.curAlias,
			itemsToDelete: [{
				id,
				type,
				parentId: window.currentSeries || "root"
			}]
		});
		if (!results?.[0]?.success) throw new Error("Delete was not confirmed by the API.");
		disposeDrag();
		card.remove();
	} catch (error) {
		button.disabled = false;
		button.textContent = "Delete failed — retry";
		button.title = error?.message || "Delete failed";
	}
}
