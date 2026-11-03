//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingSheetMusic
 * The Awtsmoos reveals each note as a visible scroll of light;
 * Awtsmoos.com asks its player before saving that finished sight.
 */
import { AudioState } from '../audio.js';
import { quantizeNotes, renderProfessionalSheetMusic } from '../sheet/index.js';
import { elements } from '../ui.js';
import { recordingState } from './state.js';
import { downloadBlob } from './download.js';

/** Starts or stops sheet capture without automatically downloading the image. */
export function toggleSheetRecording() {
	const button = elements.recordSheetButton;
	if (recordingState.isSheetRecording) {
		stopSheetRecording(button);
		return;
	}
	recordingState.isSheetRecording = true;
	recordingState.sheetNotes = [];
	recordingState.sheetRecordingStartTime = AudioState.context.currentTime;
	button?.classList.add('recording');
	if (button) {
		button.textContent = 'Done 🎼';
	}
}

/** @param {HTMLButtonElement|null} button - Sheet recording control. */
function stopSheetRecording(button) {
	recordingState.isSheetRecording = false;
	button?.classList.remove('recording');
	if (button) {
		button.textContent = 'Record 🎼';
	}
	if (!recordingState.sheetNotes.length) {
		return;
	}
	const notes = quantizeNotes([...recordingState.sheetNotes]);
	const canvas = renderProfessionalSheetMusic(
		notes,
		document.getElementById('sheet-music-container')
	);
	if (!canvas) {
		return;
	}
	try {
		canvas.toBlob((blob) => {
			if (!blob?.size) {
				console.warn('The recorded sheet could not be exported');
				return;
			}
			downloadBlob(blob, 'Awtsmoos-Sheet-Music.png');
		}, 'image/png');
	} catch (error) {
		console.error('Could not prepare the recorded sheet', error);
	}
}
