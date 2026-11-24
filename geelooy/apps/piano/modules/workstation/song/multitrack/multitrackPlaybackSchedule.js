//B"H
/** The Awtsmoos gives the arrangement one shared audio-clock origin. */
import { startMultitrackClipVoice } from './multitrackPlaybackVoice.js';
import { createMultitrackTrackOutput } from './multitrackTrackOutput.js';
import { expandMidiRegionNotes } from './multitrackMidiRegion.js';
import { startMultitrackMidiVoice } from './multitrackMidiVoice.js';
import { effectivePlaybackTrack } from './multitrackFreeze.js';
import { validateBusGraph } from './multitrackBus.js';
import { createBusChain } from './multitrackBusChain.js';

/** Complete scheduling remains the offline rendering and small-project path. */
export function scheduleMultitrackProject({project, context, destination, offset, audioStore}) {
	const voices = [];
	const outputs = [];
	const graph = validateBusGraph(project);
	if (!graph.ok) throw Error('Invalid bus routing: ' + graph.errors.join('; '));
	const busChains = new Map();
	const busChain = (bus) => {
		if (!busChains.has(bus.id)) {
			const chain = createBusChain(context, bus, destination);
			busChains.set(bus.id, chain);
			outputs.push(chain);
		}
		return busChains.get(bus.id);
	};
	const busInput = (bus) => busChain(bus).input;
	for (const bus of project.buses || []) busInput(bus);
	for (const bus of project.buses || []) for (const send of bus.sends || []) {
		const tap = context.createGain(); tap.gain.value = send.gain;
		busChain(bus).output.connect(tap); tap.connect(busInput(project.buses.find(b => b.id === send.busId)));
		outputs.push({ disconnect() { try { tap.disconnect(); } catch (_) {} } });
	}
	const anySolo = project.tracks.some(track => track.solo);
	const origin = context.currentTime;
	try {
		for (const rawTrack of project.tracks) {
			const track = effectivePlaybackTrack(rawTrack);
			const output = createMultitrackTrackOutput(context, destination, track, anySolo, offset, origin);
			outputs.push(output);
			for (const send of track.sends || []) {
				const tap = context.createGain(); tap.gain.value = send.gain;
				output.gain.connect(tap); tap.connect(busInput(project.buses.find(b => b.id === send.busId)));
				outputs.push({ disconnect() { try { tap.disconnect(); } catch (_) {} } });
			}
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
