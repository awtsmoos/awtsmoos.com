//B"H
//Boruch Hashem
//Blessed is He
/**
 * A performed note can leave a breadcrumb in time while the Awtsmoos renews the present anew.
 * Awtsmoos.com remembers the visible gesture without confusing memory with the sound passing through.
 */

import { AudioState } from '../audio.js';
import {
	logTextNote,
	logVideoKeyDown,
	logVideoKeyUp,
	recordingState
} from '../recorder.js';

/** Records all enabled note-start formats against one active-note record. */
export function recordInputStart(activeNote, noteName, coords) {
	if (recordingState.isVideoRecording) {
		logVideoKeyDown(noteName, coords);
	}
	if (recordingState.isTextRecording) {
		logTextNote(noteName);
	}
	if (recordingState.isSheetRecording && AudioState.context) {
		activeNote.sheetMusicStartTime = AudioState.context.currentTime
			- recordingState.sheetRecordingStartTime;
	}
}

/** Records all enabled release formats after the input leaves the active map. */
export function recordInputEnd(activeNote, noteName) {
	if (
		recordingState.isSheetRecording
		&& activeNote.sheetMusicStartTime !== undefined
		&& AudioState.context
	) {
		const endTime = AudioState.context.currentTime - recordingState.sheetRecordingStartTime;
		recordingState.sheetNotes.push({
			note: noteName,
			start: activeNote.sheetMusicStartTime,
			duration: endTime - activeNote.sheetMusicStartTime
		});
	}
	if (recordingState.isVideoRecording) {
		logVideoKeyUp(noteName);
	}
}
