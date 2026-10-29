//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VideoAudioFinalization
 * The Awtsmoos guards the melody when moving pictures disappear;
 * Awtsmoos.com preserves captured sound for a choice that remains clear.
 */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { recordingState, setVideoWorker } from './state.js';
import { rememberVideoAudio, recoverVideoAudio } from './videoRecovery.js';

/** @param {Blob} blob - Audio to combine with rendered piano video frames. */
export async function finalizeVideoAudio(blob) {
	if (!blob?.size) {
		if (elements.videoProgress) elements.videoProgress.textContent = 'No audio captured for video.';
		return;
	}
	rememberVideoAudio(blob);
	try {
		if (!recordingState.videoWorker) throw new Error('Video worker unavailable');
		if (elements.videoProgress) elements.videoProgress.textContent = 'Decoding audio…';
		const buffer = await AudioState.context.decodeAudioData(await blob.arrayBuffer());
		const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
			buffer.getChannelData(index).slice());
		const audioBufferShim = {
			sampleRate: buffer.sampleRate,
			length: buffer.length,
			duration: buffer.duration,
			numberOfChannels: buffer.numberOfChannels,
			channels
		};
		const worker = recordingState.videoWorker;
		if (!worker) throw new Error('Video worker stopped before muxing');
		if (elements.videoProgress) elements.videoProgress.textContent = 'Combining sound and video…';
		worker.postMessage({ type: 'FINALIZE_MUXING', payload: { audioBufferShim } },
			channels.map((channel) => channel.buffer));
	} catch (error) {
		console.error('Video could not finish; captured audio retained', error);
		const worker = recordingState.videoWorker;
		worker?.terminate();
		if (worker) setVideoWorker(null);
		recordingState.isVideoRecording = false;
		if (elements.recordVideoButton) elements.recordVideoButton.textContent = 'Record Video';
		const recovered = recoverVideoAudio();
		if (elements.videoProgress) {
			elements.videoProgress.textContent = recovered
				? 'Video unavailable. Captured audio is ready for Save or Trash.'
				: 'Video unavailable. Could not present recovered audio.';
		}
	}
}
