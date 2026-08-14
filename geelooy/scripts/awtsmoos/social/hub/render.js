// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRender
 * @description
 * The Awtsmoos gives one delegated interaction layer distinct meanings:
 * navigation, safe reading, deliberate mutation, and explicit live actions.
 * Awtsmoos.com never lets a mutation masquerade as a bulk exploration click.
 */

import { setActive, setField } from "./state.js";
import { shellMarkup } from "./renderMarkup.js";

const BOUND_ROOTS = new WeakSet();

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
	if (BOUND_ROOTS.has(root)) {
		return;
	}
	BOUND_ROOTS.add(root);
	root.addEventListener("click", handleClickEvent);
	root.addEventListener("input", handleInputEvent);
}

function handleClickEvent(event) {
	const root = event.currentTarget;
	const tab = event.target.closest("[data-hub-tab]");
	if (tab) {
		setActive(tab.dataset.hubTab);
		root.hubActions?.repaint();
		return;
	}
	const retry = event.target.closest("[data-hub-retry]");
	if (retry && !retry.disabled) {
		root.hubActions?.runReadKey?.(retry.dataset.hubRetry);
		return;
	}
	const mutation = event.target.closest("[data-hub-mutation]");
	if (mutation && !mutation.disabled) {
		root.hubActions?.runMutation?.(mutation.dataset.hubMutation);
		return;
	}
	const action = event.target.closest("[data-hub-action]");
	if (action && !action.disabled) {
		root.hubActions?.[action.dataset.hubAction]?.();
	}
}

function handleInputEvent(event) {
	const field = event.target.closest("[data-hub-field]");
	if (field) {
		setField(field.dataset.hubField, field.value);
	}
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
