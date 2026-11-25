//B"H
/** The Awtsmoos brings each wave into its vessel at the appointed musical instant. */
import { createMultitrackTrackOutput } from './multitrackTrackOutput.js';
import { startMultitrackClipVoice } from './multitrackPlaybackVoice.js';
import { effectivePlaybackTrack } from './multitrackFreeze.js';

/** Small arrangements retain native full scheduling; large ones use a rolling horizon. */
export function needsLookahead(project, offset) {
	let count = 0;
	for (const track of project.tracks) for (const clip of track.clips) {
		if (clip.timelineStart + clip.duration > offset && ++count > 128) return true;
	}
	return false;
}

/** Validate sources before allocation and stop explicitly on missed scheduling deadlines. */
export function createLookahead({project, context, destination, offset, audioStore, setTimer, clearTimer, onError, startVoice = startMultitrackClipVoice}) {
	const entries = [];
	const sources = new Map();
	const outputs = [];
	const voices = [];
	let cursor = 0;
	let timer = null;
	let closed = false;
	let initial = true;
	// Frozen tracks must be heard as their render: the lookahead path
	// applies the same unity playback view as full scheduling, or a
	// frozen track would get its gain, pan, tone and effects twice.
	const playbackTracks = project.tracks.map(track => effectivePlaybackTrack(track));
	const anySolo = playbackTracks.some(track => track.solo);
	for (const [index, track] of playbackTracks.entries()) for (const clip of track.clips) {
		if (clip.timelineStart + clip.duration <= offset) continue;
		if (!sources.has(clip.bufferId)) {
			const buffer = audioStore.getBuffer(clip.bufferId);
			if (!buffer) throw Error(`Missing decoded audio for ${clip.name}.`);
			sources.set(clip.bufferId, buffer);
		}
		entries.push({clip, index});
	}
	entries.sort((a,b) => a.clip.timelineStart - b.clip.timelineStart);
	const origin = context.currentTime;
	function retire(voice) {
		const index = voices.indexOf(voice);
		if (index >= 0) voices.splice(index, 1);
		voice.stop();
	}
	function pump() {
		timer = null;
		if (closed) return;
		const now = context.currentTime;
		const position = initial ? offset : offset + Math.max(0, now - origin);
		const horizon = position + (globalThis.document?.hidden ? 30 : 8);
		while (cursor < entries.length && entries[cursor].clip.timelineStart <= horizon) {
			const {clip, index} = entries[cursor++];
			if (!initial && position - clip.timelineStart > .05) throw Error('Audio scheduling was interrupted by the browser. Press Play to resume.');
			const voice = startVoice({context, buffer:sources.get(clip.bufferId), clip, trackOutput:outputs[index].input, when:Math.max(now, origin + clip.timelineStart - offset), projectOffset:position});
			if (!voice) continue;
			voices.push(voice);
			voice.source.addEventListener('ended', () => retire(voice), {once:true});
		}
		initial = false;
		if (cursor < entries.length) timer = setTimer(tick, 750);
	}
	function tick() {
		try { pump(); } catch (error) { close(); onError?.(error); }
	}
	function close() {
		if (closed) return;
		closed = true;
		if (timer !== null) clearTimer(timer);
		timer = null;
		for (const voice of [...voices]) retire(voice);
		for (const output of outputs) output.disconnect();
	}
	try {
		for (const track of playbackTracks) outputs.push(createMultitrackTrackOutput(context, destination, track, anySolo, offset, origin));
		pump();
	} catch (error) { close(); throw error; }
	return {voices, outputs, origin, hasAudio:entries.length > 0, close};
}
