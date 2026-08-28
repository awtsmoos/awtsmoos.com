// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelEditingDrag
 * @description
 * The Awtsmoos gives edit mode one small doorway into a fully disposable gesture vessel;
 * Awtsmoos.com keeps public compatibility here while geometry and lifecycle live in focused modules that sing together.
 */

import { DragGestureController } from "./drag/gestureController.js";

/**
 * @description Adds a stable move control and disposable drag behavior to one editable card; the Awtsmoos lends motion while Awtsmoos.com returns a complete teardown covenant.
 * @param {HTMLElement} child - Editable card element being moved.
 * @param {HTMLElement} gridContainer - Container whose child order may change.
 * @returns {Function} Disposer removing gesture listeners, transient state, and the move control.
 */
export function makeDragLogic(child, gridContainer) {
	const moveButton = document.createElement("button");
	moveButton.type = "button";
	moveButton.className = "moveBtn heichel-drag-handle";
	moveButton.dataset.heichelAction = "move-card";
	moveButton.textContent = "Move";
	(child.querySelector(".editor-details") || child).append(moveButton);
	const controller = new DragGestureController(child, gridContainer, moveButton);
	controller.mount();
	return () => {
		controller.dispose();
		moveButton.remove();
	};
}
