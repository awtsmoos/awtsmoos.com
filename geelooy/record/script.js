// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyCameraPreview
 * @description
 * The Awtsmoos opens a local camera only after deliberate permission, falls
 * back truthfully, switches lenses when possible, and stops every media track.
 */

const stage = document.querySelector(".camera-stage");
const video = document.getElementById("camera-video");
const status = document.getElementById("camera-status");
const startButton = document.getElementById("camera-start");
const switchButton = document.getElementById("camera-switch");
const stopButton = document.getElementById("camera-stop");
let activeStream = null;
let facingMode = "environment";

function setStatus(message, tone = "idle") {
	status.textContent = message;
	status.dataset.tone = tone;
}

function stopStream() {
	activeStream?.getTracks().forEach(track => track.stop());
	activeStream = null;
	video.srcObject = null;
	stage.dataset.cameraState = "idle";
	startButton.disabled = false;
	switchButton.disabled = true;
	stopButton.disabled = true;
	setStatus("Camera stopped. You can start it again at any time.");
}

async function requestCamera(preferredFacingMode) {
	const constraints = {
		video: {
			facingMode: {
				ideal: preferredFacingMode
			}
		},
		audio: false
	};
	try {
		return await navigator.mediaDevices.getUserMedia(constraints);
	} catch (preferredError) {
		if (["NotAllowedError", "SecurityError"].includes(preferredError.name)) {
			throw preferredError;
		}
		return navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false
		});
	}
}

async function startCamera() {
	if (!navigator.mediaDevices?.getUserMedia) {
		setStatus("This browser does not provide camera access.", "error");
		return;
	}
	startButton.disabled = true;
	switchButton.disabled = true;
	stopButton.disabled = true;
	stage.dataset.cameraState = "requesting";
	setStatus("Waiting for camera permission…", "busy");
	try {
		stopStreamSilently();
		activeStream = await requestCamera(facingMode);
		video.srcObject = activeStream;
		await video.play();
		stage.dataset.cameraState = "live";
		startButton.disabled = true;
		switchButton.disabled = false;
		stopButton.disabled = false;
		setStatus(`${facingMode === "environment" ? "Rear" : "Front"} camera is live.`);
	} catch (error) {
		stage.dataset.cameraState = "error";
		startButton.disabled = false;
		setStatus(cameraErrorMessage(error), "error");
	}
}

function stopStreamSilently() {
	activeStream?.getTracks().forEach(track => track.stop());
	activeStream = null;
	video.srcObject = null;
}

async function switchCamera() {
	facingMode = facingMode === "environment" ? "user" : "environment";
	await startCamera();
}

function cameraErrorMessage(error) {
	if (["NotAllowedError", "SecurityError"].includes(error.name)) {
		return "Camera permission was denied. Allow access in browser settings and try again.";
	}
	if (["NotFoundError", "DevicesNotFoundError"].includes(error.name)) {
		return "No camera was found on this device.";
	}
	if (["NotReadableError", "TrackStartError"].includes(error.name)) {
		return "The camera is already in use by another application.";
	}
	return "The camera could not start. Check the device and try again.";
}

startButton.addEventListener("click", startCamera);
switchButton.addEventListener("click", switchCamera);
stopButton.addEventListener("click", stopStream);
window.addEventListener("pagehide", stopStreamSilently);
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "hidden") {
		stopStreamSilently();
	}
});
