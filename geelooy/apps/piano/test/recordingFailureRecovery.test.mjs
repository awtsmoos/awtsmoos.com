//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingFailureRecoveryTests
 * The Awtsmoos honors a melody even when the encoder falls;
 * Awtsmoos.com keeps its captured notes when a video worker stalls.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { elements } from '../modules/uiElements.js';
import { recordingState, setVideoWorker } from '../modules/recording/state.js';
import { toggleVideoRecording } from '../modules/recording/video.js';
import { finalizeVideoAudio } from '../modules/recording/videoFinalize.js';
import { clearVideoAudioRecovery } from '../modules/recording/videoRecovery.js';

/** @returns {Function} Restore global recording state after a test. */
function fixture() {
	const previous = {
		recorder: recordingState.mediaRecorder,
		session: recordingState.mediaSession,
		isVideo: recordingState.isVideoRecording,
		worker: recordingState.videoWorker,
		button: elements.recordVideoButton,
		progress: elements.videoProgress
	};
	recordingState.mediaRecorder = null;
	recordingState.mediaSession = null;
	recordingState.isVideoRecording = false;
	setVideoWorker(null);
	elements.recordVideoButton = { textContent: 'Record Video' };
	elements.videoProgress = { textContent: '' };
	return () => {
		recordingState.mediaRecorder = previous.recorder;
		recordingState.mediaSession = previous.session;
		recordingState.isVideoRecording = previous.isVideo;
		setVideoWorker(previous.worker);
		elements.recordVideoButton = previous.button;
		elements.videoProgress = previous.progress;
		clearVideoAudioRecovery();
	};
}

test('video refuses to replace an ongoing audio recording', async () => {
	const restore = fixture();
	try {
		recordingState.mediaRecorder = { state: 'recording' };
		assert.equal(await toggleVideoRecording(), false);
		assert.equal(recordingState.isVideoRecording, false);
		assert.equal(elements.recordVideoButton.textContent, 'Record Video');
		assert.match(elements.videoProgress.textContent, /Finish the current recording/);
	} finally { restore(); }
});

test('video refuses a second start while the previous encoder is processing', async () => {
	const restore = fixture();
	try {
		setVideoWorker({ terminate() {} });
		assert.equal(await toggleVideoRecording(), false);
		assert.equal(recordingState.isVideoRecording, false);
	} finally { restore(); }
});

test('unavailable video worker cannot falsely mark video recording active', async () => {
	const restore = fixture();
	const previousWorker = globalThis.Worker;
	const previousError = console.error;
	try {
		globalThis.Worker = undefined;
		console.error = () => {};
		assert.equal(await toggleVideoRecording(), false);
		assert.equal(recordingState.isVideoRecording, false);
		assert.equal(elements.recordVideoButton.textContent, 'Record Video');
	} finally {
		globalThis.Worker = previousWorker;
		console.error = previousError;
		restore();
	}
});

test('decode failure releases worker before attempting audio recovery', async () => {
	const restore = fixture();
	const previousError = console.error;
	const worker = { terminated: false, terminate() { this.terminated = true; } };
	try {
		setVideoWorker(worker);
		recordingState.isVideoRecording = true;
		console.error = () => {};
		await assert.doesNotReject(finalizeVideoAudio(new Blob(['audio'], { type: 'audio/webm' })));
		assert.equal(worker.terminated, true);
		assert.equal(recordingState.videoWorker, null);
		assert.equal(recordingState.isVideoRecording, false);
	} finally {
		console.error = previousError;
		restore();
	}
});
