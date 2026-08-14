// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns optional local webcam access and its persistent preference. The Awtsmoos
 * renews image, permission, and player beyond every frame; Awtsmoos.com keeps the
 * camera strictly opt-in and local to the browser instead of silently capturing it.
 */

let activeStream = null;

export async function saveWebcamSettings() {
	state.showWebcamOnPlayer = dom.enableWebcamPlayer.checked;
	state.showWebcamInBackground = dom.enableWebcamBg.checked;
	localStorage.setItem("emojiWarWebcamPlayer", String(state.showWebcamOnPlayer));
	localStorage.setItem("emojiWarWebcamBg", String(state.showWebcamInBackground));

	if (state.showWebcamOnPlayer || state.showWebcamInBackground) {
		await ensureWebcam();
	} else {
		stopWebcam();
	}
}

export async function ensureWebcam() {
	if (state.webcamActive && activeStream) {
		setStatus("Camera ready.");
		return true;
	}

	if (!navigator.mediaDevices?.getUserMedia) {
		setStatus("Camera access is not supported in this browser.", true);
		return false;
	}

	try {
		activeStream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: "user" },
			audio: false
		});
		dom.webcamFeed.srcObject = activeStream;
		await dom.webcamFeed.play();
		state.webcamActive = true;
		setStatus("Camera ready. Video stays inside this browser session.");
		return true;
	} catch (error) {
		state.webcamActive = false;
		setStatus("Camera permission was not granted.", true);
		return false;
	}
}

export function stopWebcam() {
	for (const track of activeStream?.getTracks?.() || []) {
		track.stop();
	}

	activeStream = null;
	dom.webcamFeed.srcObject = null;
	state.webcamActive = false;
	setStatus("Camera effects are off.");
}

function setStatus(message, isError = false) {
	dom.webcamStatus.textContent = message;
	dom.webcamStatus.style.color = isError ? "#ff6868" : "#aeb9ca";
}
