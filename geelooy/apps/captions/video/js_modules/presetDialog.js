// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioPresetDialog
 * @description
 * The Awtsmoos replaces prompt, alert, and confirm with one accessible local
 * dialog for naming or deleting a caption-studio preset.
 */

import { DOM } from "./config.js";

let dialogMode = "save";
let pendingResolve = null;
let initialized = false;

export function requestPresetSave() {
	return openDialog("save", DOM.presetSelect?.value || "");
}

export function requestPresetDelete() {
	const selected = DOM.presetSelect?.value || "";
	if (!selected) {
		return Promise.resolve(null);
	}
	return openDialog("delete", selected);
}

function openDialog(mode, currentName) {
	initializeDialog();
	dialogMode = mode;
	DOM.presetDialogError.textContent = "";
	DOM.presetName.value = currentName;
	DOM.presetNameField.hidden = mode === "delete";
	DOM.presetDialogTitle.textContent = mode === "save"
		? "Save preset"
		: "Delete preset";
	DOM.presetDialogCopy.textContent = mode === "save"
		? "Name this local configuration. Existing names will be replaced."
		: `Delete “${currentName}” from this browser?`;
	DOM.presetDialogConfirm.textContent = mode === "save"
		? "Save preset"
		: "Delete preset";
	DOM.presetDialogConfirm.value = "confirm";
	DOM.presetDialog.showModal();
	if (mode === "save") {
		queueMicrotask(() => DOM.presetName.focus());
	}
	return new Promise(resolve => {
		pendingResolve = resolve;
	});
}

function initializeDialog() {
	if (initialized || !DOM.presetDialog) {
		return;
	}
	initialized = true;
	DOM.presetDialog.addEventListener("submit", handleSubmit);
	DOM.presetDialog.addEventListener("close", handleClose);
	DOM.presetDialog.addEventListener("cancel", () => {
		DOM.presetDialog.returnValue = "cancel";
	});
}

function handleSubmit(event) {
	const submitter = event.submitter;
	if (submitter?.value !== "confirm" || dialogMode !== "save") {
		return;
	}
	const name = DOM.presetName.value.trim();
	if (!name) {
		event.preventDefault();
		DOM.presetDialogError.textContent = "Enter a preset name before saving.";
		DOM.presetName.focus();
	}
}

function handleClose() {
	if (!pendingResolve) {
		return;
	}
	const confirmed = DOM.presetDialog.returnValue === "confirm";
	const result = confirmed
		? dialogMode === "save"
			? DOM.presetName.value.trim()
			: DOM.presetSelect.value
		: null;
	pendingResolve(result || null);
	pendingResolve = null;
}
