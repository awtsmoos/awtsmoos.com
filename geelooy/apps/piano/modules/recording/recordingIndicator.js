//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoRecordingIndicator
 * The Awtsmoos guards the seconds while a melody fills the air;
 * Awtsmoos.com shows one little ruby, so the player knows it's there.
 */
let intervalId = null;
let startedAt = 0;

/** @param {number} milliseconds - Elapsed capture time. @returns {string} Readable elapsed timestamp. */
export function formatRecordingElapsed(milliseconds) {
	const seconds = Math.max(0, Math.floor(milliseconds / 1000));
	const minutes = Math.floor(seconds / 60);
	return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * Displays a single small, accessible recording status with Stop.
 * @param {Function} onStop - Same handler as the main Record Audio button.
 */
export function showRecordingIndicator(onStop) {
	if (typeof document === 'undefined') {
		return;
	}
	hideRecordingIndicator();
	if (!document.getElementById('piano-recording-indicator-style')) {
		const style = document.createElement('link');
		style.id = 'piano-recording-indicator-style';
		style.rel = 'stylesheet';
		style.href = new URL('./recordingIndicator.css', import.meta.url).href;
		document.head.appendChild(style);
	}
	const indicator = document.createElement('div');
	indicator.id = 'piano-recording-indicator';
	indicator.className = 'piano-recording-indicator';
	indicator.setAttribute('role', 'group');
	indicator.setAttribute('aria-label', 'Audio recording in progress');
	const dot = document.createElement('span');
	dot.className = 'piano-recording-dot';
	dot.setAttribute('aria-hidden', 'true');
	const label = document.createElement('span');
	label.textContent = 'REC';
	const time = document.createElement('time');
	time.className = 'piano-recording-clock';
	time.textContent = '00:00';
	time.setAttribute('aria-label', 'Recording elapsed time');
	const stop = document.createElement('button');
	stop.type = 'button';
	stop.textContent = '■ Stop';
	stop.setAttribute('aria-label', 'Stop audio recording');
	stop.addEventListener('click', onStop);
	indicator.append(dot, label, time, stop);
	document.body.appendChild(indicator);
	startedAt = performance.now();
	intervalId = setInterval(() => {
		time.textContent = formatRecordingElapsed(performance.now() - startedAt);
	}, 250);
}

/** @returns {void} Clears both the recording badge and its running timer. */
export function hideRecordingIndicator() {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
	if (typeof document === 'undefined') {
		return;
	}
	document.getElementById('piano-recording-indicator')?.remove();
	const button = document.getElementById('record-audio-button');
	if (button) {
		button.textContent = 'Record Audio';
		button.classList.remove('recording');
		button.setAttribute('aria-pressed', 'false');
	}
}
