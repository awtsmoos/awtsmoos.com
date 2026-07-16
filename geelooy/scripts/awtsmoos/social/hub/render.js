// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRender
 * @description
 * The Awtsmoos paints the Social Hub and binds one delegated interaction layer.
 * Awtsmoos.com preserves field focus through API and socket repaints.
 */

import { setActive, setField } from "./state.js";
import { shellMarkup } from "./renderMarkup.js";

const boundRoots = new WeakSet();

export function render(root, actions) {
	if (!root) {
		return;
	}
	const focus = captureFocus(root);
	root.hubActions = actions;
	root.innerHTML = shellMarkup();
	bindRoot(root);
	restoreFocus(root, focus);
}

function bindRoot(root) {
	if (boundRoots.has(root)) {
		return;
	}
	boundRoots.add(root);
	root.addEventListener("click", event => handleClick(root, event));
	root.addEventListener("input", event => handleInput(event));
}

function handleClick(root, event) {
	const tab = event.target.closest("[data-hub-tab]");
	if (tab) {
		setActive(tab.dataset.hubTab);
		root.hubActions?.repaint();
		return;
	}
	const action = event.target.closest("[data-hub-action]");
	if (!action || action.disabled) {
		return;
	}
	root.hubActions?.[action.dataset.hubAction]?.();
}

function handleInput(event) {
	const field = event.target.closest("[data-hub-field]");
	if (!field) {
		return;
	}
	setField(field.dataset.hubField, field.value);
}

function captureFocus(root) {
	const active = document.activeElement;
	if (!active || !root.contains(active) || !active.dataset.hubField) {
		return null;
	}
	return {
		field: active.dataset.hubField,
		start: active.selectionStart,
		end: active.selectionEnd
	};
}

function restoreFocus(root, focus) {
	if (!focus) {
		return;
	}
	const field = root.querySelector(`[data-hub-field="${focus.field}"]`);
	if (!field) {
		return;
	}
	field.focus({ preventScroll: true });
	if (typeof field.setSelectionRange === "function") {
		field.setSelectionRange(focus.start, focus.end);
	}
}
