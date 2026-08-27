// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioRenderActions
 * @description
 * The Awtsmoos prepares local assets for bounded previews or exact final output,
 * and releases the studio if an interactive preview exceeds its time covenant.
 */

import { AppState } from "./state.js";
import { DOM } from "./config.js";
import { getCaptionData, getSettings, prepareBitmaps } from "./data.js";
import { readFinalResolution, readFrameRate, readPreviewResolution } from "./resolution.js";
import { sendMessage } from "./worker_client.js";
import { setStatus, showMobilePreview, switchVisuals, updateUI } from "./ui.js";

const previewTimeoutMilliseconds = 8000;

export async function triggerRender() {
	if (AppState.status !== "IDLE") return;
	AppState.status = "RENDERING";
	prepareBusyState("Preparing local assets…");
	showMobilePreview();
	switchVisuals("canvas");
	try {
		const settings = getSettings();
		const captionData = await getCaptionData();
		const { bitmaps, transferables } = await prepareBitmaps();
		captionData.plainAudioBuffer?.channels.forEach(channel => {
			transferables.push(channel.buffer);
		});
		const mode = DOM.renderMode.value;
		const workerMode = DOM.enableImageDownload.checked && mode === "image"
			? "imageBatch"
			: mode;
		sendMessage("START_RENDER", {
			mode: workerMode,
			settings,
			resolution: readFinalResolution(),
			captionData,
			portalBitmaps: bitmaps,
			plainAudioBuffer: captionData.plainAudioBuffer,
			fps: readFrameRate()
		}, transferables);
	} catch (error) {
		recoverFromError(`Preparation failed: ${error.message}`);
	}
}

export async function triggerPreview(manual = false) {
	if (AppState.status !== "IDLE") return;
	AppState.status = "PREVIEWING";
	prepareBusyState("Updating preview…");
	if (manual) {
		showMobilePreview();
		switchVisuals("canvas");
	}
	const resolution = readPreviewResolution();
	DOM.previewCanvas.width = resolution.width;
	DOM.previewCanvas.height = resolution.height;
	try {
		const settings = getSettings();
		const { bitmaps, transferables } = await prepareBitmaps();
		const primaryCaption = DOM.mainCaptions.value
			.split(/\n\s*\n/)[0]
			.trim() || "PREVIEW TEXT";
		schedulePreviewTimeout();
		sendMessage("GENERATE_PREVIEW", {
			settings,
			resolution,
			primaryCaption,
			portalBitmaps: bitmaps
		}, transferables);
	} catch (error) {
		recoverFromError(`Preview failed: ${error.message}`);
	}
}

export function clearPreviewTimeout() {
	window.clearTimeout(AppState.previewTimeout);
	AppState.previewTimeout = null;
}

function schedulePreviewTimeout() {
	clearPreviewTimeout();
	AppState.previewTimeout = window.setTimeout(() => {
		if (AppState.status !== "PREVIEWING") return;
		AppState.worker?.terminate();
		AppState.worker = null;
		AppState.status = "IDLE";
		updateUI(AppState);
		setStatus("Preview took too long. Reduce effects or try again.", "warning");
	}, previewTimeoutMilliseconds);
}

function prepareBusyState(message) {
	DOM.progressBar.style.width = "0%";
	updateUI(AppState);
	setStatus(message);
}

function recoverFromError(message) {
	clearPreviewTimeout();
	console.error(message);
	AppState.status = "IDLE";
	updateUI(AppState);
	setStatus(message, "error");
}
