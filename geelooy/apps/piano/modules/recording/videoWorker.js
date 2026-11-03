//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VideoWorkerLifecycle
 * The Awtsmoos carries every frame to its maker's final choice;
 * Awtsmoos.com preserves the sound if its image loses its voice.
 */
import { elements } from '../ui.js';
import { recordingState, setVideoWorker } from './state.js';
import { stopMediaRecorder } from './media.js';
import { downloadBlob } from './download.js';
import { clearVideoAudioRecovery, recoverVideoAudio } from './videoRecovery.js';

/** @returns {Worker} Isolated encoder with guarded failure handlers. */
export function createVideoWorker() {
	const worker = new Worker(`./synth-video-worker.js?bh=${Date.now()}`);
	worker.onmessage = (event) => handleWorkerMessage(worker, event.data);
	worker.onerror = (event) => {
		console.error('Video worker error', event.message || event);
		failVideo(worker, 'Video processor stopped unexpectedly.');
	};
	setVideoWorker(worker);
	return worker;
}

/** @param {Worker} worker - Active encoder. @param {Object} data - Worker result. */
function handleWorkerMessage(worker, data = {}) {
	if (recordingState.videoWorker !== worker) return;
	const progress = elements.videoProgress;
	const { type, payload } = data;
	if (type === 'STATUS_UPDATE' && progress) {
		progress.textContent = String(payload?.message || 'Processing video…');
	} else if (type === 'PROGRESS_UPDATE' && progress) {
		progress.textContent = `Processing video: ${payload?.percent ?? 0}%`;
	} else if (type === 'VIDEO_COMPLETE') {
		if (!payload?.blob?.size) {
			failVideo(worker, 'Video encoder returned an empty recording.');
			return;
		}
		const offered = downloadBlob(payload.blob, `BH-Video-${Date.now()}.mp4`);
		if (offered) clearVideoAudioRecovery();
		if (progress) progress.textContent = offered
			? 'Video ready. Choose Save or Trash.'
			: 'Video could not be offered. Captured audio may still be recoverable.';
		cleanupVideoWorker(worker);
	} else if (type === 'FATAL_ERROR') {
		failVideo(worker, String(payload?.message || 'Video processing failed.'));
	}
}

/** @param {Worker} worker - Failed encoder. @param {string} message - Failure. */
function failVideo(worker, message) {
	if (recordingState.videoWorker !== worker) return;
	if (recordingState.mediaSession?.mode === 'video') {
		recordingState.mediaSession.mode = 'audio';
		stopMediaRecorder();
	}
	cleanupVideoWorker(worker);
	const recovered = recoverVideoAudio();
	if (elements.videoProgress) {
		elements.videoProgress.textContent = recovered
			? `${message} Captured audio is ready for Save or Trash.` : message;
	}
}

/** @param {Worker} worker - Encoder to release safely. */
function cleanupVideoWorker(worker) {
	worker.terminate();
	if (recordingState.videoWorker === worker) setVideoWorker(null);
	recordingState.isVideoRecording = false;
	if (elements.recordVideoButton) elements.recordVideoButton.textContent = 'Record Video';
}
