//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMain
 * The Awtsmoos receives the first tap before its orchestra enters the room;
 * Awtsmoos.com shows the keys clearly and brings each note out of the gloom.
 */
import { initAudio } from './modules/audio.js';
import { createStartupProgress } from './modules/app/startupProgress.js';

let busy = false;
let shellPromise = null;

/** Keeps the compact rail layout available before any deferred studio is loaded. */
function installKeyboardLayout() {
	if (document.getElementById('awtsmoos-piano-scrollbar-layout-css')) {
		return;
	}
	const link = document.createElement('link');
	link.id = 'awtsmoos-piano-scrollbar-layout-css';
	link.rel = 'stylesheet';
	link.href = new URL('./modules/keyboard/styles/scrollbarLayout.css', import.meta.url).href;
	document.head.appendChild(link);
}

/** @returns {void} Registers Start before the large piano controller is imported. */
function bindStart() {
	installKeyboardLayout();
	const button = document.getElementById('start-button');
	const screen = document.getElementById('start-screen');
	if (!button || !screen) {
		return;
	}
	button.addEventListener('click', () => startFromGesture(button, screen));
}

/**
 * Opens sound in the user's real gesture with synchronous failure recovery.
 * @param {HTMLButtonElement} button - Visible retryable Start button.
 * @param {HTMLElement} screen - Welcome screen and progress output.
 */
function startFromGesture(button, screen) {
	if (busy) {
		return;
	}
	busy = true;
	button.disabled = true;
	const loading = createStartupProgress(screen);
	loading.update(5, 'Starting sound…');
	let audioPromise;
	try {
		audioPromise = Promise.resolve(initAudio());
	} catch (error) {
		console.error('Could not unlock piano audio', error);
		loading.fail('Audio could not start. Tap Start to retry.');
		busy = false;
		button.disabled = false;
		return;
	}
	void finishStartup(button, loading, audioPromise);
}

/**
 * Loads optional controls after sound and guards failures and retries.
 * @param {HTMLButtonElement} button - The original Start control.
 * @param {Object} loading - Visible progress controller.
 * @param {Promise<boolean>} audioPromise - Audio task opened by the tap.
 */
async function finishStartup(button, loading, audioPromise) {
	try {
		await nextPaint();
		loading.update(16, 'Loading piano controls…');
		shellPromise ||= import('./modules/app/pianoShell.js');
		const shell = await bounded(shellPromise, 12000);
		const controls = shell.initializePianoShell();
		const started = await shell.startPlayablePiano(controls, { audioPromise, loading });
		if (!started) {
			loading.fail('Unable to start sound. Tap Start to retry.');
		}
	} catch (error) {
		console.error('Piano could not load', error);
		shellPromise = null;
		loading.fail('Piano loading stopped. Tap Start to retry.');
	} finally {
		busy = false;
		button.disabled = false;
	}
}

/** @param {Promise} task - Import. @param {number} milliseconds - Deadline. */
function bounded(task, milliseconds) {
	let timeout;
	const deadline = new Promise((_, reject) => {
		timeout = setTimeout(() => reject(new Error('Piano loading timed out')), milliseconds);
	});
	return Promise.race([task, deadline]).finally(() => clearTimeout(timeout));
}

/** @returns {Promise<void>} Allows real loading progress to paint. */
function nextPaint() {
	return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', bindStart, { once: true });
} else {
	bindStart();
}
