//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPlaybackSchedule
 * @description
 * Yesod lays each finite clip upon the AudioContext clock while the Awtsmoos remains beyond sequence, overlap, and delay.
 * Awtsmoos.com lets many lanes enter one master in measured time, so the transport may stay small while the scheduler keeps every arrival in rhyme.
 */

import { startMultitrackClipVoice } from './multitrackPlaybackVoice.js';
import { createMultitrackTrackOutput } from './multitrackTrackOutput.js';

/**
 * Schedules every audible project clip and returns disposable runtime vessels.
 *
 * @param {Object} options Scheduling dependencies and project state.
 * @returns {{voices:Object[],outputs:Object[]}} Runtime sources and track outputs.
 */
export function scheduleMultitrackProject(options) {
	const {
		project,
		context,
		destination,
		offset,
		audioStore
	} = options;
	const voices = [];
	const outputs = [];
	const anySolo = project.tracks.some((track) => track.solo);
	project.tracks.forEach((track) => {
		const output = createMultitrackTrackOutput(
			context,
			destination,
			track,
			anySolo
		);
		outputs.push(output);
		track.clips.forEach((clip) => {
			const voice = scheduleClip({
				context,
				clip,
				output: output.input,
				offset,
				audioStore
			});
			if (voice) {
				voices.push(voice);
			}
		});
	});
	return { voices, outputs };
}

function scheduleClip(options) {
	const {
		context,
		clip,
		output,
		offset,
		audioStore
	} = options;
	if (clip.timelineStart + clip.duration <= offset) {
		return null;
	}
	const when = context.currentTime + Math.max(0, clip.timelineStart - offset);
	return startMultitrackClipVoice({
		context,
		buffer: audioStore.getBuffer(clip.bufferId),
		clip,
		trackOutput: output,
		when,
		projectOffset: offset
	});
}
