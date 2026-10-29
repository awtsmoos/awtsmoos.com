//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VideoRecording
 * The Awtsmoos gathers moving light and music in one ordered line;
 * Awtsmoos.com calls it recording only when sound and frame align.
 */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { recordingState, setVideoWorker } from './state.js';
import { startMediaRecorder, stopMediaRecorder } from './media.js';
import { createVideoWorker } from './videoWorker.js';
import { makeVideoConfig } from './videoConfig.js';
import { logVideoKeyUp } from './videoEvents.js';

/** @returns {Promise<boolean>} True only if recording actually started. */
export async function toggleVideoRecording() {
	const button = elements.recordVideoButton;
	if (recordingState.isVideoRecording) return stopVideoRecording(button);
	if (recordingState.videoWorker || recordingState.mediaRecorder?.state !== undefined) {
		showVideoError('Finish the current recording or processing before starting video.');
		return false;
	}
	let worker = null;
	try {
		const config = makeVideoConfig();
		worker = createVideoWorker();
		if (!startMediaRecorder('video')) throw new Error('Audio capture could not start for video');
		recordingState.videoKeyDownMap.clear();
		recordingState.videoStartTime = AudioState.context.currentTime;
		worker.postMessage({ type: 'INITIALIZE_RENDERER', payload: config });
		recordingState.isVideoRecording = true;
		if (button) button.textContent = 'Stop Video';
		showVideoError('Recording video and sound…');
		return true;
	} catch (error) {
		console.error('Video recording could not start', error);
		worker?.terminate();
		if (recordingState.videoWorker === worker) setVideoWorker(null);
		if (recordingState.mediaSession?.mode === 'video') {
			recordingState.mediaSession.mode = 'audio';
			stopMediaRecorder();
		}
		recordingState.isVideoRecording = false;
		if (button) button.textContent = 'Record Video';
		showVideoError('Video could not start. Any captured sound may still be recovered.');
		return false;
	}
}

/** @param {HTMLButtonElement|null} button - Stop control. @returns {boolean} Stop accepted. */
function stopVideoRecording(button) {
	const time = AudioState.context.currentTime;
	for (const noteName of recordingState.videoKeyDownMap.keys()) logVideoKeyUp(noteName, time);
	recordingState.videoKeyDownMap.clear();
	const stopped = stopMediaRecorder();
	recordingState.isVideoRecording = false;
	if (button) button.textContent = stopped ? 'Processing Video...' : 'Record Video';
	showVideoError(stopped
		? 'Finalizing video. Save or Trash appears when ready.'
		: 'The video recorder was no longer active.');
	return stopped;
}

/** @param {string} message - Recording status or failure. */
function showVideoError(message) {
	if (elements.videoProgress) elements.videoProgress.textContent = message;
}
