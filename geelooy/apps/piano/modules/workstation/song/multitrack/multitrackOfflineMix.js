//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackOfflineMix
 * The Awtsmoos gathers every edited note into a single faithful stream;
 * Awtsmoos.com preserves trim, gain, overlapping clips and pan within the dream.
 */
import { multitrackProjectDuration } from './multitrackProject.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { scheduleMultitrackProject } from './multitrackPlaybackSchedule.js';

const MAX_SECONDS = 8 * 60;

/** Renders the finished arrangement without speakers, at the requested PCM rate.
 * @param {Object} project - Current multitrack arrangement.
 * @param {Object} audioStore - Browser-local decoded audio sources.
 * @param {number} sampleRate - 44100 for WAV, 48000 for WebCodecs Opus.
 * @returns {Promise<AudioBuffer>} Completed stereo audio mix.
 */
export async function renderMultitrackOffline(project, audioStore = multitrackAudioStore, sampleRate = 44100) {
	const clips = project?.tracks?.flatMap(track => track.clips || []) || [];
	if (!clips.length) throw new Error('Add or record audio before downloading the finished song.');
	const duration = multitrackProjectDuration(project);
	if (!(duration > 0) || duration > MAX_SECONDS) {
		throw new Error('Song must be between zero and eight minutes for mobile audio export.');
	}
	const Context = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
	if (!Context) throw new Error('This browser does not support offline audio export.');
	for (const clip of clips) {
		if (!audioStore.getBuffer(clip.bufferId)) {
			throw new Error(`Missing original audio for ${clip.name || 'a clip'}. Reimport the source.`);
		}
	}
	const context = new Context(2, Math.ceil((duration + .05) * sampleRate), sampleRate);
	const { voices } = scheduleMultitrackProject({
		project, context, destination: context.destination, offset: 0, audioStore
	});
	if (!voices.length) throw new Error('This song contains no playable audio clips.');
	return context.startRendering();
}
