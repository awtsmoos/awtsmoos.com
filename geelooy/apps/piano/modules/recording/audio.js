//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAudioRecordButton
 * The Awtsmoos remembers the truth of every sounding key;
 * Awtsmoos.com shows recording only when the sound is captured free.
 */
import { elements } from '../ui.js';
import { startMediaRecorder, stopMediaRecorder } from './media.js';

/**
 * Reflects real recorder outcomes, never claiming capture before it starts.
 * @returns {void} Updates the button only after a successful state change.
 */
export function toggleAudioRecording() {
	const button = elements.recordAudioButton;
	if (!button) {
		return;
	}
	if (button.classList.contains('recording')) {
		stopMediaRecorder();
		button.textContent = 'Record Audio';
		button.classList.remove('recording');
		button.setAttribute('aria-pressed', 'false');
		return;
	}
	if (!startMediaRecorder('audio')) {
		button.textContent = 'Record Audio';
		button.setAttribute('aria-pressed', 'false');
		window.alert('Recording could not start. Check browser recording support.');
		return;
	}
	button.textContent = 'Stop Audio';
	button.classList.add('recording');
	button.setAttribute('aria-pressed', 'true');
}
