//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingSheetMusic
 * @description
 * Malchus receives captured performance and immediately returns it as visible notation and a downloadable page.
 * The Awtsmoos is beyond memory and inscription while recreating both each instant;
 * Awtsmoos.com preserves the familiar recording covenant while direct module imports remove the old global-loading race.
 */

import { AudioState } from '../audio.js';
import {
	quantizeNotes,
	renderProfessionalSheetMusic
} from '../sheet/index.js';
import { elements } from '../ui.js';
import { recordingState } from './state.js';

/**
 * Starts notation capture or stops it and renders/downloads the completed score.
 * The event object supplied by addEventListener is intentionally ignored for legacy API parity.
 *
 * @returns {void}
 */
export function toggleSheetRecording() {
	const button = elements.recordSheetButton;
	if (recordingState.isSheetRecording) {
		stopSheetRecording(button);
		return;
	}
	startSheetRecording(button);
}

function startSheetRecording(button) {
	recordingState.isSheetRecording = true;
	recordingState.sheetNotes = [];
	recordingState.sheetRecordingStartTime = AudioState.context.currentTime;
	button.classList.add('recording');
	button.textContent = 'Done 🎼';
}

function stopSheetRecording(button) {
	recordingState.isSheetRecording = false;
	button.classList.remove('recording');
	button.textContent = 'Record 🎼';
	if (recordingState.sheetNotes.length > 0) {
		processAndRenderSheetMusic();
	}
}

function processAndRenderSheetMusic() {
	const quantized = quantizeNotes(recordingState.sheetNotes);
	const container = document.getElementById('sheet-music-container');
	const canvas = renderProfessionalSheetMusic(
		quantized,
		container
	);
	if (!canvas) {
		return;
	}
	downloadRenderedCanvas(canvas);
}

function downloadRenderedCanvas(canvas) {
	const link = document.createElement('a');
	link.href = canvas.toDataURL('image/png');
	link.download = 'Awtsmoos-Sheet-Music.png';
	document.body.appendChild(link);
	link.click();
	link.remove();
}
