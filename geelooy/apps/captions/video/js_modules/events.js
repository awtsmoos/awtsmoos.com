// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioEvents
 * @description
 * The Awtsmoos binds one coherent core loop for rendering, settings, source
 * choice, randomization, cancellation, and focused asynchronous operations.
 */

import { DOM } from "./config.js";
import { AppState } from "./state.js";
import { triggerPreview, triggerRender } from "./renderActions.js";
import { hideMobilePreview, setStatus, updateUI } from "./ui.js";
import { initWorker } from "./worker_client.js";
import { saveSettings } from "./storage.js";
import { randomizeAll, randomizeSection } from "./randomize.js";
import {
	cacheSrt,
	chooseFolder,
	deleteNamedPreset,
	loadNamedPreset,
	saveNamedPreset
} from "./eventOperations.js";

export function attachEvents() {
	DOM.renderButton?.addEventListener("click", triggerRender);
	DOM.previewButton?.addEventListener("click", () => triggerPreview(true));
	DOM.mobileCloseBtn?.addEventListener("click", hideMobilePreview);
	DOM.cancelButton?.addEventListener("click", cancelRender);
	DOM.controlsDiv?.addEventListener("input", handleInput);
	DOM.controlsDiv?.addEventListener("change", handleChange);
	DOM.selectDownloadFolderButton?.addEventListener("click", chooseFolder);
	DOM.savePresetBtn?.addEventListener("click", saveNamedPreset);
	DOM.deletePresetBtn?.addEventListener("click", deleteNamedPreset);
	DOM.presetSelect?.addEventListener("change", loadNamedPreset);
	DOM.randomizeAllBtn?.addEventListener("click", randomizeAll);
	DOM.srtFile?.addEventListener("change", event => cacheSrt(event, "main"));
	DOM.translationSrtFile?.addEventListener("change", event => cacheSrt(event, "trans"));
	document.querySelectorAll(".fieldset-randomize").forEach(button => {
		button.addEventListener("click", () => randomizeSection(button.closest("fieldset")));
	});
}

function handleInput(event) {
	updateValueDisplay(event.target);
	saveSettings(AppState);
	window.clearTimeout(AppState.previewTimer);
	AppState.previewTimer = window.setTimeout(() => {
		if (AppState.status === "IDLE") {
			triggerPreview(false);
		}
	}, 400);
}

function handleChange(event) {
	if (event.target.matches("[data-caption-source]")) {
		DOM.captionSource.value = event.target.value;
	}
	saveSettings(AppState);
	updateUI(AppState);
	if (AppState.status === "IDLE") {
		triggerPreview(false);
	}
}

function updateValueDisplay(control) {
	if (control.type !== "range") {
		return;
	}
	const display = document.getElementById(`${control.id}Value`);
	if (display) {
		display.textContent = control.value;
	}
}

function cancelRender() {
	initWorker();
	AppState.status = "IDLE";
	updateUI(AppState);
	hideMobilePreview();
	setStatus("Render cancelled. The local engine is ready again.", "warning");
}
