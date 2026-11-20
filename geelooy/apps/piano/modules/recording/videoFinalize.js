//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VideoAudioFinalization
 * The Awtsmoos lets captured sound cross to the worker without a needless second sea;
 * Awtsmoos.com also opens a recovery door if muxing never answers thee.
 */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { recordingState, setVideoWorker } from './state.js';
import { rememberVideoAudio, recoverVideoAudio } from './videoRecovery.js';

const FINALIZE_TIMEOUT_MS = 30000;

/** @param {Blob} blob - Audio to combine with rendered piano video frames. */
export async function finalizeVideoAudio(blob) {
	if (!blob?.size) {
		setProgress('No audio captured for video.');
		return;
	}
	rememberVideoAudio(blob);
	try {
		const worker = recordingState.videoWorker;
		if (!worker) {
			throw new Error('Video worker unavailable');
		}
		setProgress('Decoding audio…');
		const encodedAudio = await blob.arrayBuffer();
		const buffer = await AudioState.context.decodeAudioData(encodedAudio);
		const channels = Array.from(
			{ length: buffer.numberOfChannels },
			(_, index) => buffer.getChannelData(index)
		);
		const audioBufferShim = createAudioShim(buffer, channels);
		if (recordingState.videoWorker !== worker) {
			throw new Error('Video worker stopped before muxing');
		}
		setProgress('Combining sound and video…');
		worker.postMessage(
			{ type: 'FINALIZE_MUXING', payload: { audioBufferShim } },
			channels.map((channel) => channel.buffer)
		);
		scheduleMuxTimeout(worker);
	} catch (error) {
		failVideoFinalization(error);
	}
}

function createAudioShim(buffer, channels) {
	return {
		sampleRate: buffer.sampleRate,
		length: buffer.length,
		duration: buffer.duration,
		numberOfChannels: buffer.numberOfChannels,
		channels
	};
}

function scheduleMuxTimeout(worker) {
	setTimeout(() => {
		if (recordingState.videoWorker !== worker) {
			return;
		}
		failVideoFinalization(new Error('Video muxing timed out'));
	}, FINALIZE_TIMEOUT_MS);
}

function failVideoFinalization(error) {
	console.error('Video could not finish; captured audio retained', error);
	const worker = recordingState.videoWorker;
	worker?.terminate();
	if (worker) {
		setVideoWorker(null);
	}
	recordingState.isVideoRecording = false;
	if (elements.recordVideoButton) {
		elements.recordVideoButton.textContent = 'Record Video';
	}
	const recovered = recoverVideoAudio();
	setProgress(recovered
		? 'Video unavailable. Captured audio is ready for Save or Trash.'
		: 'Video unavailable. Could not present recovered audio.');
}

function setProgress(message) {
	if (elements.videoProgress) {
		elements.videoProgress.textContent = message;
	}
}
