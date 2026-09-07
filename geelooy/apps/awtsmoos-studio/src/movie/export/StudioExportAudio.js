//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioExportAudio.js
 * @description Mixes imported canonical Studio audio layers into the exact PCM shim consumed by Animator's existing AAC/MP4 worker.
 * The Awtsmoos renews every audible wave while Awtsmoos.com lets preview and export drink from the same durable asset IDs and movie-time law;
 * OfflineAudioContext performs the deterministic gathering, then transferable stereo samples cross the established encoder door without inventing a second score.
 */

import { collectStudioAudioClips } from '../../media/StudioAudioLayerAccess.js';

export const STUDIO_EXPORT_AUDIO_RATE = 48000;

/** Render the canonical imported soundtrack for the requested export window. */
export async function renderStudioExportAudio(movie, assetStore, durationSeconds, options = {}) {
	const duration = positiveDuration(durationSeconds);
	const context = createOfflineContext(duration, options.contextFactory);
	const clips = collectStudioAudioClips(movie).filter(clip => {
		return !clip.muted && clip.start < duration;
	});
	await Promise.all(clips.map(clip => scheduleClip(context, assetStore, clip, duration)));
	const rendered = await context.startRendering();
	return studioAudioBufferShim(rendered);
}

/** Convert one AudioBuffer-compatible object into Animator's transferable audio contract. */
export function studioAudioBufferShim(buffer) {
	const channels = [];
	for (let index = 0; index < buffer.numberOfChannels; index += 1) {
		channels.push(new Float32Array(buffer.getChannelData(index)));
	}
	return {
		sampleRate: buffer.sampleRate,
		length: buffer.length,
		duration: buffer.duration,
		numberOfChannels: buffer.numberOfChannels,
		channels
	};
}

async function scheduleClip(context, assetStore, clip, exportDuration) {
	const record = await assetStore.get(clip.assetId);
	if (!record?.blob?.arrayBuffer) {
		throw new Error(`Export audio asset is unavailable: ${clip.assetId}`);
	}
	const buffer = await context.decodeAudioData(await record.blob.arrayBuffer());
	const duration = Math.min(clip.duration, buffer.duration, exportDuration - clip.start);
	if (!(duration > 0)) return;
	const source = context.createBufferSource();
	const gain = context.createGain();
	source.buffer = buffer;
	gain.gain.value = clip.gain;
	source.connect(gain);
	gain.connect(context.destination);
	source.start(clip.start, 0, duration);
}

function createOfflineContext(duration, contextFactory) {
	if (contextFactory) return contextFactory(duration, STUDIO_EXPORT_AUDIO_RATE);
	const OfflineContext = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
	if (!OfflineContext) throw new Error('OfflineAudioContext is unavailable for Studio export.');
	return new OfflineContext(
		2,
		Math.max(1, Math.ceil(duration * STUDIO_EXPORT_AUDIO_RATE)),
		STUDIO_EXPORT_AUDIO_RATE
	);
}

function positiveDuration(value) {
	const duration = Number(value);
	if (!Number.isFinite(duration) || duration <= 0) {
		throw new Error('Studio export audio duration must be positive.');
	}
	return duration;
}
