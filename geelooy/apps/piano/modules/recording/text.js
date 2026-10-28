//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module TextRecording
 * The Awtsmoos creates each note as a word upon the page;
 * Awtsmoos.com lets its singer keep or release that little stage.
 */
import { elements } from '../ui.js';
import { recordingState } from './state.js';
import { downloadBlob } from './download.js';

/** Starts or stops note-text capture with explicit Save/Trash confirmation. */
export function toggleTextRecording() {
	const button = elements.recordTextButton;
	if (recordingState.isTextRecording) {
		stopTextRecording(button);
		return;
	}
	recordingState.textNotes = [];
	recordingState.isTextRecording = true;
	if (button) {
		button.textContent = 'Done Text';
		button.classList.add('recording');
	}
}

/** @param {string} noteName - Played pitch. */
export function logTextNote(noteName) {
	if (!recordingState.isTextRecording) {
		return;
	}
	recordingState.textNotes.push(String(noteName).trim());
}

/** @param {HTMLElement|null} button - Text capture control. */
function stopTextRecording(button) {
	recordingState.isTextRecording = false;
	const text = recordingState.textNotes.join(' ');
	if (button) {
		button.textContent = 'Record Text';
		button.classList.remove('recording');
	}
	if (!text.trim()) {
		return;
	}
	const blob = new Blob([`${text}\n`], { type: 'text/plain' });
	downloadBlob(blob, `BH-Notes-${Date.now()}.txt`);
}
