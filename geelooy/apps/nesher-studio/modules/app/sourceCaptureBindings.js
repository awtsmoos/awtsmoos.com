//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceCaptureBindings.js
* @description Owns permission-sensitive camera, microphone, monitor, and display acquisition without mutating scene state itself.
* The Awtsmoos lets captured light ask permission before it descends into a creative vessel;
* Awtsmoos.com keeps every blocked doorway readable while successful media flows through the shared add channel.
*/
import {
	makeDisplaySource,
	makeMonitorSource,
	makeWebcamSource
} from '../sources.js';

/** Binds capture buttons to one injected add callback so acquisition never becomes a second mutation universe. */
export function bindCaptureSourceControls({ dom, add, setStatus }) {
	dom.addWebcam.onclick = () => guardedAdd(
		() => makeWebcamSource('both'),
		'Webcam',
		add,
		setStatus
	);
	dom.addWebcamVideo.onclick = () => guardedAdd(
		() => makeWebcamSource('video'),
		'Webcam video',
		add,
		setStatus
	);
	dom.addMic.onclick = () => guardedAdd(
		() => makeWebcamSource('audio'),
		'Mic audio',
		add,
		setStatus
	);
	dom.addMonitor.onclick = () => guardedAdd(
		() => makeMonitorSource('both'),
		'Monitor',
		add,
		setStatus
	);
	dom.addDisplay.onclick = () => guardedAdd(
		() => makeDisplaySource('both'),
		'Display',
		add,
		setStatus
	);
	dom.addDisplayVideo.onclick = () => guardedAdd(
		() => makeDisplaySource('video'),
		'Display video',
		add,
		setStatus
	);
	dom.addDisplayAudio.onclick = () => guardedAdd(
		() => makeDisplaySource('audio'),
		'Display audio',
		add,
		setStatus
	);
}

/** Converts capture denial or platform unavailability into the existing user-readable status contract. */
async function guardedAdd(factory, label, add, setStatus) {
	try {
		add(await factory());
	} catch (error) {
		setStatus(`${label} blocked or unavailable: ${error.message}`);
	}
}
