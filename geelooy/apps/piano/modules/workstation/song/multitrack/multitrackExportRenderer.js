//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackExportRenderer
 * @description
 * Yesod schedules the same project graph into an offline vessel while the Awtsmoos remains beyond live and rendered time.
 * Awtsmoos.com lets the downloaded song arise from the same gains, pans, trims, solos, mutes, and tones the listener hears in rhyme.
 */

import { multitrackAudioStore } from './multitrackAudioStore.js';
import { scheduleMultitrackProject } from './multitrackPlaybackSchedule.js';
import { multitrackProjectDuration } from './multitrackProject.js';

const DEFAULT_SAMPLE_RATE = 48000;

/** Renders the complete project into a stereo AudioBuffer using the playback scheduler. */
export async function renderMultitrackProjectMix(project, options = {}) {
	const duration = multitrackProjectDuration(project);
	if (duration <= 0) {
		throw new Error('Add audible clips before downloading audio.');
	}
	const audioStore = options.audioStore || multitrackAudioStore;
	assertSourceBuffers(project, audioStore);
	const OfflineContext = options.OfflineAudioContextClass
		|| globalThis.OfflineAudioContext
		|| globalThis.webkitOfflineAudioContext;
	if (!OfflineContext) {
		throw new Error('This browser cannot render an offline audio mix.');
	}
	const scheduleProject = options.scheduleProject || scheduleMultitrackProject;
	const sampleRate = Math.max(8000, Number(options.sampleRate) || DEFAULT_SAMPLE_RATE);
	const frames = Math.max(1, Math.ceil(duration * sampleRate));
	options.onProgress?.('Scheduling the edited mix…');
	const context = new OfflineContext(2, frames, sampleRate);
	const runtime = scheduleProject({
		project,
		context,
		destination: context.destination,
		offset: 0,
		audioStore
	});
	options.onProgress?.('Rendering the finished mix…');
	const rendered = await context.startRendering();
	disposeRuntime(runtime);
	return rendered;
}

function assertSourceBuffers(project, audioStore) {
	project.tracks.forEach((track) => {
		track.clips.forEach((clip) => {
			if (!audioStore.getBuffer(clip.bufferId)) {
				throw new Error(`Missing source audio for clip “${clip.name || clip.id}”.`);
			}
		});
	});
}

function disposeRuntime(runtime) {
	runtime?.voices?.forEach((voice) => voice?.stop?.());
	runtime?.outputs?.forEach((output) => output?.disconnect?.());
}
