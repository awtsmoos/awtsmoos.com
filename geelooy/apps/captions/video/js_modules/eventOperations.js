// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioEventOperations
 * @description
 * The Awtsmoos owns folder, preset, and SRT operations outside the core input
 * loop so each asynchronous doorway remains small, visible, and recoverable.
 */

import { DOM } from "./config.js";
import { AppState } from "./state.js";
import { setStatus, updateUI } from "./ui.js";
import { triggerPreview } from "./renderActions.js";
import {
	applyPreset,
	deletePreset,
	savePreset
} from "./storage.js";
import {
	requestPresetDelete,
	requestPresetSave
} from "./presetDialog.js";

export async function chooseFolder() {
	if (!("showDirectoryPicker" in window)) {
		setStatus("Folder selection is unavailable; browser downloads will be used.", "warning");
		return;
	}
	try {
		AppState.dirHandle = await window.showDirectoryPicker();
		DOM.folderDisplay.textContent = `Selected folder: ${AppState.dirHandle.name}`;
		setStatus("Download folder selected.", "success");
	} catch (error) {
		if (error.name !== "AbortError") {
			setStatus("The download folder could not be opened.", "error");
		}
	}
}

export async function saveNamedPreset() {
	const name = await requestPresetSave();
	if (!name) {
		return;
	}
	const saved = await savePreset(AppState, name);
	setStatus(
		saved ? `Preset “${name}” saved locally.` : "Preset could not be saved.",
		saved ? "success" : "error"
	);
}

export async function deleteNamedPreset() {
	const name = await requestPresetDelete();
	if (!name) {
		return;
	}
	const deleted = await deletePreset(AppState, name);
	setStatus(
		deleted ? `Preset “${name}” deleted.` : "Preset could not be deleted.",
		deleted ? "success" : "error"
	);
}

export async function loadNamedPreset(event) {
	const name = event.target.value;
	if (!name) {
		return;
	}
	if (await applyPreset(AppState, name)) {
		updateUI(AppState);
		setStatus(`Preset “${name}” loaded.`, "success");
		triggerPreview(false);
	}
}

export async function cacheSrt(event, key) {
	const file = event.target.files?.[0];
	AppState.srtText[key] = file ? await file.text() : "";
}
