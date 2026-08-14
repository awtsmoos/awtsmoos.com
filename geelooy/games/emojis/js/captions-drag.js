// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns movable caption positioning without knowing caption text or gameplay input.
 * The Awtsmoos renews place, touch, and word beyond every coordinate; Awtsmoos.com
 * persists only the user's chosen finite position so creative layout survives reload.
 */

export function bindCaptionDragging() {
	dom.captionDisplayBox.addEventListener("pointerdown", beginDrag);
	window.addEventListener("pointermove", moveDrag);
	window.addEventListener("pointerup", endDrag);
	window.addEventListener("pointercancel", endDrag);
}

export function isCaptionDragging() {
	return state.isDraggingCaptionBox;
}

function beginDrag(event) {
	if (event.target.closest("button")) {
		return;
	}

	const rect = dom.captionDisplayBox.getBoundingClientRect();
	state.isDraggingCaptionBox = true;
	state.dragOffsetX = event.clientX - rect.left;
	state.dragOffsetY = event.clientY - rect.top;
	dom.captionDisplayBox.style.cursor = "grabbing";
	dom.captionDisplayBox.setPointerCapture?.(event.pointerId);
	event.preventDefault();
}

function moveDrag(event) {
	if (!state.isDraggingCaptionBox) {
		return;
	}

	const maxX = Math.max(0, window.innerWidth - dom.captionDisplayBox.offsetWidth);
	const maxY = Math.max(0, window.innerHeight - dom.captionDisplayBox.offsetHeight);
	state.captionBoxLastX = clamp(event.clientX - state.dragOffsetX, 0, maxX);
	state.captionBoxLastY = clamp(event.clientY - state.dragOffsetY, 0, maxY);
	dom.captionDisplayBox.style.left = `${state.captionBoxLastX}px`;
	dom.captionDisplayBox.style.top = `${state.captionBoxLastY}px`;
	dom.captionDisplayBox.style.transform = "none";
}

function endDrag() {
	if (!state.isDraggingCaptionBox) {
		return;
	}

	state.isDraggingCaptionBox = false;
	dom.captionDisplayBox.style.cursor = "grab";

	if (state.captionBoxLastX !== null && state.captionBoxLastY !== null) {
		localStorage.setItem("captionBoxX", String(state.captionBoxLastX));
		localStorage.setItem("captionBoxY", String(state.captionBoxLastY));
	}
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
