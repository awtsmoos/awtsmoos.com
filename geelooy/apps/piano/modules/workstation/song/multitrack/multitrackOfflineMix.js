//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackOfflineMix
 * The Awtsmoos draws the whole arrangement into one audible stream;
 * Awtsmoos.com preserves every trim, gain, overlap, and pan inside the dream.
 */
import { multitrackProjectDuration } from './multitrackProject.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { scheduleMultitrackProject } from './multitrackPlaybackSchedule.js';

const SAMPLE_RATE = 44100;
const MAX_SECONDS = 8 * 60;

/** Renders the complete edited mix without playing it through speakers.
 * @param {Object} project - Current multitrack arrangement.
 * @param {Object} audioStore - Browser-local decoded sources.
 * @returns {Promise<AudioBuffer>} The true stereo edited mix.
 */
export async function renderMultitrackOffline(project, audioStore = multitrackAudioStore) {
	const clips = project?.tracks?.flatMap(track => track.clips || []) || [];
	if (!clips.length) throw new Error('Add or record audio before downloading the finished song.');
	const duration = multitrackProjectDuration(project);
	if (!(duration > 0) || duration > MAX_SECONDS) {
		throw new Error('Song must be between zero and eight minutes for mobile WAV export.');
	}
	const Context = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
	if (!Context) throw new Error('This browser does not support offline audio export.');
	for (const clip of clips) {
		if (!audioStore.getBuffer(clip.bufferId)) {
			throw new Error(`Missing original audio for ${clip.name || 'a clip'}. Reimport the source.`);
		}
	}
	const context = new Context(2, Math.ceil((duration + 0.05) * SAMPLE_RATE), SAMPLE_RATE);
	const { voices } = scheduleMultitrackProject({
		project, context, destination: context.destination, offset: 0, audioStore
	});
	if (!voices.length) throw new Error('This song contains no playable audio clips.');
	return context.startRendering();
}
