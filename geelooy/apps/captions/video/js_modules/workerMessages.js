// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioWorkerMessages
 * @description
 * The Awtsmoos translates worker receipts into preview, video, progress, download,
 * and recoverable studio state while clearing every bounded preview covenant.
 */

import { AppState } from "./state.js";
import { CTX, DOM } from "./config.js";
import { processQueue } from "./downloads.js";
import { setStatus, showMobilePreview, switchVisuals, updateUI } from "./ui.js";

export function handleWorkerMessage(event) {
	const { type, payload } = event.data;
	const handlers = {
		WORKER_READY: handleReady,
		STATUS_UPDATE: () => setStatus(payload.message),
		PROGRESS_UPDATE: () => updateProgress(payload.percent),
		PREVIEW_READY: () => handlePreview(payload),
		VIDEO_COMPLETE: () => handleVideo(payload),
		IMAGE_COMPLETE: () => handleImage(payload),
		BATCH_COMPLETE: handleBatchComplete,
		FATAL_ERROR: () => handleFatal(payload)
	};
	handlers[type]?.();
}

function handleReady() {
	AppState.status = "IDLE";
	updateUI(AppState);
	setStatus("Local render engine ready.", "success");
	if (!AppState.initialPreviewPending) return;
	AppState.initialPreviewPending = false;
	import("./renderActions.js").then(module => {
		module.triggerPreview(false);
	}).catch(error => {
		console.warn("Initial preview could not start.", error);
	});
}

function updateProgress(percent) {
	if (!DOM.progressBar || !DOM.progressContainer) return;
	DOM.progressContainer.hidden = false;
	DOM.progressBar.style.width = `${Math.max(0, Math.min(100, Number(percent) || 0))}%`;
}

function handlePreview(payload) {
	clearPreviewTimer();
	if (CTX && payload.bitmap) {
		switchVisuals("canvas");
		CTX.clearRect(0, 0, DOM.previewCanvas.width, DOM.previewCanvas.height);
		CTX.drawImage(payload.bitmap, 0, 0, DOM.previewCanvas.width, DOM.previewCanvas.height);
		payload.bitmap.close();
	}
	AppState.status = "IDLE";
	updateUI(AppState);
	setStatus("Preview updated.", "success");
}

function handleVideo(payload) {
	if (AppState.videoURL) URL.revokeObjectURL(AppState.videoURL);
	AppState.videoURL = URL.createObjectURL(payload.blob);
	DOM.outputVideo.src = AppState.videoURL;
	switchVisuals("video");
	showMobilePreview();
	AppState.status = "IDLE";
	updateUI(AppState);
	setStatus("Render complete. The video is ready to review.", "success");
}

function handleImage(payload) {
	AppState.downloadQueue.push(payload);
	processQueue(AppState);
}

function handleBatchComplete() {
	AppState.status = "IDLE";
	updateUI(AppState);
	setStatus("Image batch complete.", "success");
}

function handleFatal(payload) {
	clearPreviewTimer();
	AppState.status = "IDLE";
	updateUI(AppState);
	setStatus(`Render failed: ${payload.message}`, "error");
}

function clearPreviewTimer() {
	window.clearTimeout(AppState.previewTimeout);
	AppState.previewTimeout = null;
}
