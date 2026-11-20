//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMediaCapture
 * The Awtsmoos keeps each second near so stopping can answer without delay;
 * Awtsmoos.com still writes recovery crumbs to disk while memory carries the common way.
 */
import { AudioState } from '../audio.js';
import { recordingState } from './state.js';
import { downloadBlob } from './download.js';
import { recordingExtension, selectRecordingMime } from './mediaFormats.js';
import { finalizeVideoAudio } from './videoFinalize.js';
import { storeRecordingChunk, readRecordingChunks, clearRecordingChunks } from './mediaStorage.js';

/** @param {'audio'|'video'} mode - Destination. @returns {boolean} Whether capture started. */
export function startMediaRecorder(mode) {
	if (recordingState.mediaRecorder?.state !== undefined) {
		return false;
	}
	try {
		if (!globalThis.MediaRecorder || !AudioState.mediaStreamDestination?.stream) {
			throw new Error('Audio recording is not supported by this browser');
		}
		const chosenMime = selectRecordingMime();
		const recorder = new MediaRecorder(
			AudioState.mediaStreamDestination.stream,
			chosenMime ? { mimeType: chosenMime } : undefined
		);
		const session = createSession(mode, recorder.mimeType || chosenMime || 'audio/webm');
		recorder.ondataavailable = (event) => handleData(session, event.data);
		recorder.onerror = (event) => console.error('Recording error', event.error || event);
		recorder.onstop = () => void finalizeRecording(session).catch(console.error);
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

/** @returns {boolean} Whether stop was requested. */
export function stopMediaRecorder() {
	const recorder = recordingState.mediaRecorder;
	if (!recorder || recorder.state === 'inactive') {
		return false;
	}
	recorder.stop();
	return true;
}

function createSession(mode, mimeType) {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		mode,
		mimeType,
		index: 0,
		memoryRows: [],
		fallback: []
	};
}

function handleData(session, blob) {
	if (!blob?.size) {
		return;
	}
	const row = { sessionId: session.id, index: session.index++, blob };
	session.memoryRows.push(row);
	recordingState.mediaWriteChain = recordingState.mediaWriteChain
		.then(() => storeRecordingChunk(row))
		.catch((error) => {
			console.warn('Recording chunk kept in memory after storage failure', error);
			session.fallback.push(row);
		});
}

async function finalizeRecording(session) {
	try {
		await recordingState.mediaWriteChain;
		const rows = await resolveRows(session);
		const blob = new Blob(rows.map((row) => row.blob), { type: session.mimeType });
		if (!blob.size) {
			console.warn('The recording contained no audio samples');
			return;
		}
		if (session.mode === 'audio') {
			const extension = recordingExtension(session.mimeType);
			downloadBlob(blob, `BH-Audio-${Date.now()}.${extension}`);
		} else {
			await finalizeVideoAudio(blob);
		}
	} finally {
		void clearRecordingChunks(session.id).catch(console.warn);
		session.memoryRows.length = 0;
		session.fallback.length = 0;
		if (recordingState.mediaSession === session) {
			recordingState.mediaSession = null;
			recordingState.mediaRecorder = null;
		}
	}
}

async function resolveRows(session) {
	if (session.memoryRows.length === session.index) {
		return [...session.memoryRows].sort((a, b) => a.index - b.index);
	}
	try {
		const stored = await readRecordingChunks(session.id);
		return [...stored, ...session.fallback].sort((a, b) => a.index - b.index);
	} catch (error) {
		console.warn('Recorded chunks read from memory only', error);
		return [...session.memoryRows].sort((a, b) => a.index - b.index);
	}
}
