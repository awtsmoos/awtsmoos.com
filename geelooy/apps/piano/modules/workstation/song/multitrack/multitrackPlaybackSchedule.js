//B"H
/** The Awtsmoos gives the arrangement one shared audio-clock origin. */
import { startMultitrackClipVoice } from './multitrackPlaybackVoice.js';
import { createMultitrackTrackOutput } from './multitrackTrackOutput.js';
import { expandMidiRegionNotes } from './multitrackMidiRegion.js';
import { startMultitrackMidiVoice } from './multitrackMidiVoice.js';

/** Complete scheduling remains the offline rendering and small-project path. */
export function scheduleMultitrackProject({project, context, destination, offset, audioStore}) {
	const voices = [];
	const outputs = [];
	const anySolo = project.tracks.some(track => track.solo);
	const origin = context.currentTime;
	try {
		for (const track of project.tracks) {
			const output = createMultitrackTrackOutput(context, destination, track, anySolo, offset, origin);
			outputs.push(output);
			for (const clip of track.clips) {
				if (clip.timelineStart + clip.duration <= offset) continue;
				const voice = startMultitrackClipVoice({context, buffer:audioStore.getBuffer(clip.bufferId), clip, trackOutput:output.input, when:origin + Math.max(0, clip.timelineStart - offset), projectOffset:offset});
				if (voice) voices.push(voice);
			}
			for (const region of track.midiRegions || []) {
				for (const note of expandMidiRegionNotes(region)) {
					if (note.end <= offset) continue;
					const start = Math.max(note.start, offset);
					const voice = startMultitrackMidiVoice({context, trackOutput:output.input, waveform:track.midiInstrument, when:origin + start - offset, note:{...note, duration:note.end - start}});
					if (voice) voices.push(voice);
				}
			}
		}
	} catch (error) {
		for (const voice of voices) voice.stop();
		for (const output of outputs) output.disconnect();
		throw error;
	}
	return {voices, outputs, origin};
}
