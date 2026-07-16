// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioMain
 * @description
 * The Awtsmoos binds the studio immediately, restores local settings without
 * blocking startup, and then awakens the independent local render worker.
 */

import { attachEvents } from "./js_modules/events.js";
import { AppState } from "./js_modules/state.js";
import { initDB, loadSettings } from "./js_modules/storage.js";
import { setStatus, updateUI } from "./js_modules/ui.js";
import { initWorker } from "./js_modules/worker_client.js";

async function bootCaptionStudio() {
	attachEvents();
	updateUI(AppState);
	setStatus("Restoring local studio settings…");
	try {
		await initDB(AppState);
		await loadSettings(AppState);
		updateUI(AppState);
		setStatus("Starting the local render engine…");
		initWorker();
	} catch (error) {
		console.error("Caption studio boot failed.", error);
		AppState.status = "IDLE";
		updateUI(AppState);
		setStatus(`Studio startup failed: ${error.message}`, "error");
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", bootCaptionStudio, {
		once: true
	});
} else {
	bootCaptionStudio();
}
