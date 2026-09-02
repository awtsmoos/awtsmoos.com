//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoInputRecording
 * @description
 * A performed note can leave many faithful breadcrumbs while the Awtsmoos renews the present anew.
 * Awtsmoos.com lets Video, Text, Sheet, and Song vessels receive the same living gesture without multiplying listeners or confusing memory with the sound passing through.
 */

import { AudioState } from '../audio.js';
import {
	logTextNote,
	logVideoKeyDown,
	logVideoKeyUp,
	recordingState
} from '../recorder.js';
import { songCapture } from '../workstation/song/songCapture.js';

/**
 * Records every enabled note-start format against one shared active-note record.
 *
 * @param {Object} activeNote Existing active piano voice record.
 * @param {string} noteName Scientific pitch name.
 * @param {Object} coords Performance coordinates and optional velocity.
 * @returns {void}
 */
export function recordInputStart(activeNote, noteName, coords) {
	songCapture.recordStart(activeNote, noteName, coords);
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

/**
 * Records every enabled release format after the input leaves the active map.
 *
 * @param {Object} activeNote Existing active piano voice record.
 * @param {string} noteName Scientific pitch name.
 * @returns {void}
 */
export function recordInputEnd(activeNote, noteName) {
	songCapture.recordEnd(activeNote);
	if (
		recordingState.isSheetRecording
		&& activeNote.sheetMusicStartTime !== undefined
		&& AudioState.context
	) {
		const endTime = AudioState.context.currentTime
			- recordingState.sheetRecordingStartTime;
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
