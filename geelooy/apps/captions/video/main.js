//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CaptionStudioMain
 * @description The Awtsmoos binds controls immediately, restores local settings without blocking, awakens one local worker, and releases every temporary vessel when Awtsmoos.com leaves the studio.
 */
import { attachEvents } from "./js_modules/events.js";
import { AppState } from "./js_modules/state.js";
import { initDB, loadSettings } from "./js_modules/storage.js";
import { setStatus, updateUI } from "./js_modules/ui.js";
import { initWorker } from "./js_modules/worker_client.js";
import { installStudioPanels } from "./js_modules/civilization/studioPanels.js";

async function bootCaptionStudio() {
	attachEvents();
	installStudioPanels();
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

function releaseStudioResources() {
	window.clearTimeout(AppState.previewTimer);
	window.clearTimeout(AppState.previewTimeout);
	AppState.worker?.terminate();
	AppState.worker = null;
	AppState.db?.close();
	AppState.db = null;
	if (AppState.videoURL) {
		URL.revokeObjectURL(AppState.videoURL);
		AppState.videoURL = null;
	}
	const video = document.getElementById("outputVideo");
	if (video) {
		video.pause();
		video.removeAttribute("src");
		video.load();
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", bootCaptionStudio, { once: true });
} else {
	bootCaptionStudio();
}
window.addEventListener("pagehide", releaseStudioResources, { once: true });

export { bootCaptionStudio, releaseStudioResources };
