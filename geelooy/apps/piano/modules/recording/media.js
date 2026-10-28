//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMediaCapture
 * The Awtsmoos holds each fleeting note through time's retreat;
 * Awtsmoos.com gathers the whole performance, complete.
 */
import { AudioState } from '../audio.js';
import { recordingState } from './state.js';
import { downloadBlob } from './download.js';
import { recordingExtension, selectRecordingMime } from './mediaFormats.js';
import { finalizeVideoAudio } from './videoFinalize.js';
import { storeRecordingChunk, readRecordingChunks, clearRecordingChunks } from './mediaStorage.js';

/**
 * Starts recording only when a live stream and the browser codec are ready.
 * @param {'audio'|'video'} mode - Destination of the captured sound.
 * @returns {boolean} True only after MediaRecorder.start succeeds.
 */
export function startMediaRecorder(mode) {
	if (recordingState.mediaRecorder?.state !== undefined) {
		return false;
	}
	try {
		if (!globalThis.MediaRecorder || !AudioState.mediaStreamDestination?.stream) {
			throw new Error('Audio recording is not supported by this browser');
		}
		const chosenMime = selectRecordingMime();
		const options = chosenMime ? { mimeType: chosenMime } : undefined;
		const recorder = new MediaRecorder(AudioState.mediaStreamDestination.stream, options);
		const session = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
			mode,
			mimeType: recorder.mimeType || chosenMime || 'audio/webm',
			index: 0,
			fallback: []
		};
		recorder.ondataavailable = (event) => {
			if (event.data?.size > 0) {
				queueRecordedChunk(session, event.data);
			}
		};
		recorder.onerror = (event) => console.error('Recording error', event.error || event);
		recorder.onstop = () => {
			void finalizeRecording(session).catch(console.error);
		};
		recorder.start(1000);
		recordingState.mediaRecorder = recorder;
		recordingState.mediaSession = session;
		recordingState.mediaWriteChain = Promise.resolve();
		return true;
	} catch (error) {
		console.error('Could not start recording', error);
		return false;
	}
}

/** @returns {boolean} True when a recording stop was actually requested. */
export function stopMediaRecorder() {
	const recorder = recordingState.mediaRecorder;
	if (!recorder || recorder.state === 'inactive') {
		return false;
	}
	recorder.stop();
	return true;
}

/**
 * Queues each captured sound chunk for durable storage or memory fallback.
 * @param {Object} session - Stable capture session.
 * @param {Blob} blob - Recorded one-second chunk.
 */
function queueRecordedChunk(session, blob) {
	const row = { sessionId: session.id, index: session.index++, blob };
	recordingState.mediaWriteChain = recordingState.mediaWriteChain
		.then(() => storeRecordingChunk(row))
		.catch((error) => {
			console.warn('Recording chunk kept in memory after storage failure', error);
			session.fallback.push(row);
		});
}

/**
 * Combines correctly ordered chunks and releases capture state after export.
 * @param {Object} session - Recorder session to finalize.
 * @returns {Promise<void>} Fully assembled audio saved or sent to video.
 */
async function finalizeRecording(session) {
	try {
		await recordingState.mediaWriteChain;
		let stored = [];
		try {
			stored = await readRecordingChunks(session.id);
		} catch (error) {
			console.warn('Recorded chunks read from memory only', error);
		}
		const rows = [...stored, ...session.fallback].sort((a, b) => a.index - b.index);
		const blob = new Blob(rows.map((row) => row.blob), { type: session.mimeType });
		if (blob.size > 0) {
			if (session.mode === 'audio') {
				const extension = recordingExtension(session.mimeType);
				downloadBlob(blob, `BH-Audio-${Date.now()}.${extension}`);
			} else {
				finalizeVideoAudio(blob);
			}
		} else {
			console.warn('The recording contained no audio samples');
		}
		void clearRecordingChunks(session.id).catch(console.warn);
	} finally {
		if (recordingState.mediaSession === session) {
			recordingState.mediaSession = null;
			recordingState.mediaRecorder = null;
		}
	}
}
