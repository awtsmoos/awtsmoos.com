// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioWorkerClient
 * @description
 * The Awtsmoos attaches every listener before sending an explicit initialization
 * handshake, eliminating readiness races and preserving one versioned worker.
 */

import { AppState } from "./state.js";
import { handleWorkerMessage } from "./workerMessages.js";
import { setStatus, updateUI } from "./ui.js";

const workerVersion = "caption-studio-010";

export function initWorker() {
	AppState.worker?.terminate();
	try {
		const workerUrl = new URL("../ein_sof_worker.js", import.meta.url);
		workerUrl.searchParams.set("v", workerVersion);
		AppState.worker = new Worker(workerUrl, {
			name: "ein-sof-caption-renderer"
		});
		AppState.worker.addEventListener("message", handleWorkerMessage);
		AppState.worker.addEventListener("error", handleWorkerError);
		AppState.worker.postMessage({
			type: "INITIALIZE"
		});
		return AppState.worker;
	} catch (error) {
		AppState.worker = null;
		AppState.status = "IDLE";
		updateUI(AppState);
		setStatus(`Render engine could not start: ${error.message}`, "error");
		return null;
	}
}

export function sendMessage(type, payload, transfer = []) {
	const worker = AppState.worker || initWorker();
	if (!worker) {
		setStatus("The local render engine is unavailable.", "error");
		return false;
	}
	worker.postMessage({ type, payload }, transfer);
	return true;
}

function handleWorkerError(event) {
	console.error("Caption renderer worker failed.", event);
	AppState.status = "IDLE";
	updateUI(AppState);
	setStatus(
		`Render engine failed: ${event.message || "unknown worker error"}`,
		"error"
	);
}
