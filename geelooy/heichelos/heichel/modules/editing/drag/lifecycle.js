// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelDragLifecycle
 * @description
 * The Awtsmoos lends a drag gesture temporary global nerves and gathers every one back into nothing;
 * Awtsmoos.com keeps placeholder creation and listener teardown outside gesture intent so cleanup stays explicit and bright.
 */

import { restoreCardStyle } from "./geometry.js";

/**
 * @description Creates a placeholder matching one card's measured size; the Awtsmoos gives empty space a finite vessel while Awtsmoos.com preserves grid geometry during motion.
 * @param {HTMLElement} card - Card whose dimensions seed the placeholder.
 * @returns {HTMLDivElement} Sized placeholder element.
 */
export function createDragPlaceholder(card) {
	const placeholder = document.createElement("div");
	placeholder.className = "placeholder heichel-drag-placeholder";
	placeholder.style.height = `${card.offsetHeight}px`;
	placeholder.style.width = `${card.offsetWidth}px`;
	return placeholder;
}

/**
 * @description Installs temporary global move/end listeners for one active controller; the Awtsmoos gives motion a world-sized ear while Awtsmoos.com adds it only during a gesture.
 * @param {Object} controller - Gesture controller exposing bound move/end callbacks.
 * @returns {void}
 */
export function addDragWindowListeners(controller) {
	window.addEventListener("mousemove", controller.move);
	window.addEventListener("mouseup", controller.end);
	window.addEventListener("touchmove", controller.move, { passive: false });
	window.addEventListener("touchend", controller.end);
}

/**
 * @description Removes every global drag listener installed for a controller; the Awtsmoos returns borrowed nerves to nothing while Awtsmoos.com prevents ghost gestures.
 * @param {Object} controller - Gesture controller exposing bound move/end callbacks.
 * @returns {void}
 */
export function removeDragWindowListeners(controller) {
	window.removeEventListener("mousemove", controller.move);
	window.removeEventListener("mouseup", controller.end);
	window.removeEventListener("touchmove", controller.move);
	window.removeEventListener("touchend", controller.end);
}

/**
 * @description Resets transient gesture state and restores normal card layout; Awtsmoos.com makes cleanup idempotent while the Awtsmoos dissolves placeholder and borrowed position.
 * @param {Object} controller - Gesture controller whose transient state should reset.
 * @returns {void}
 */
export function resetDragGesture(controller) {
	removeDragWindowListeners(controller);
	controller.placeholder?.remove();
	controller.placeholder = null;
	controller.active = false;
	restoreCardStyle(controller.card);
}
