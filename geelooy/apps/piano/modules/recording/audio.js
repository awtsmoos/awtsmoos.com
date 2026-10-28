//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAudioRecordButton
 * The Awtsmoos keeps every sounding note through the sweep of time;
 * Awtsmoos.com holds a little red witness above the sounding rhyme.
 */
import { elements } from '../ui.js';
import { startMediaRecorder, stopMediaRecorder } from './media.js';
import { recordingState } from './state.js';
import { showRecordingIndicator, hideRecordingIndicator } from './recordingIndicator.js';

/**
 * Toggles the real MediaRecorder and synchronizes both recording controls.
 * @returns {void} A red timer appears only after successful audio capture start.
 */
export function toggleAudioRecording() {
	const button = elements.recordAudioButton;
	if (!button) {
		return;
	}
	if (button.classList.contains('recording')) {
		if (stopMediaRecorder()) {
			hideRecordingIndicator();
		}
		return;
	}
	if (!startMediaRecorder('audio')) {
		button.textContent = 'Record Audio';
		button.setAttribute('aria-pressed', 'false');
		window.alert('Recording could not start. Check browser recording support.');
		return;
	}
	// Build the indicator before styling the button; its reset clears old UI.
	showRecordingIndicator(toggleAudioRecording);
	button.textContent = 'Stop Audio';
	button.classList.add('recording');
	button.setAttribute('aria-pressed', 'true');
	// Unexpected stop or error must never leave a false red REC.
	const recorder = recordingState.mediaRecorder;
	recorder?.addEventListener('stop', hideRecordingIndicator, { once: true });
	recorder?.addEventListener('error', hideRecordingIndicator, { once: true });
}
