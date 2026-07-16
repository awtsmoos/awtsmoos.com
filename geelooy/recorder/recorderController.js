// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRecorderController
 * @description
 * The Awtsmoos gives one recording source independent permission, preview,
 * recording, save, error, and cleanup behavior inside the local Geelooy studio.
 */

import {
	beginRecording,
	stopRecording,
	stopStream
} from "./mediaCapture.js";
import {
	errorMessage,
	formatBytes,
	kindLabel,
	stateLabel
} from "./recorderCopy.js";

export function createRecorderController(kind, acquireStream) {
	const card = document.querySelector(`[data-recorder-card="${kind}"]`);
	const preview = document.getElementById(`${kind}-preview`);
	const status = document.getElementById(`${kind}-status`);
	const startButton = document.getElementById(`${kind}-record`);
	const stopButton = document.getElementById(`${kind}-stop`);
	let session = null;

	function setState(state, message) {
		card.dataset.state = state;
		card.querySelector(".capture-state").textContent = stateLabel(state);
		status.textContent = message;
		startButton.disabled = ["requesting", "recording", "stopping"].includes(state);
		stopButton.disabled = state !== "recording";
		startButton.setAttribute("aria-pressed", String(state === "recording"));
	}

	async function start() {
		setState("requesting", `Waiting for ${kind} permission…`);
		try {
			const stream = await acquireStream();
			preview.srcObject = stream;
			await preview.play();
			session = beginRecording(
				stream,
				kind,
				blob => finish(blob),
				error => fail(error)
			);
			setState("recording", `${kindLabel(kind)} recording is active.`);
		} catch (error) {
			fail(error);
		}
	}

	function stop() {
		if (!session) {
			return;
		}
		setState("stopping", "Finalizing the recording and preparing your download…");
		stopRecording(session);
	}

	function finish(blob) {
		preview.srcObject = null;
		session = null;
		setState("ready", `Saved ${formatBytes(blob.size)} locally. You can record again.`);
	}

	function fail(error) {
		stopStream(session?.stream || preview.srcObject);
		preview.srcObject = null;
		session = null;
		setState("error", errorMessage(error));
	}

	function cleanup() {
		stopRecording(session);
		stopStream(preview.srcObject);
		preview.srcObject = null;
		session = null;
	}

	startButton.addEventListener("click", start);
	stopButton.addEventListener("click", stop);
	return { cleanup };
}
