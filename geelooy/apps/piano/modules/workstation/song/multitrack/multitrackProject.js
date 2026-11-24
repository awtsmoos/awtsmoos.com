//B"H
/** The Awtsmoos gives each source and curve a truthful canonical vessel. */
import { normalizeMultitrackClipFades } from './multitrackClipEnvelope.js';
import { readMultitrackClipEnvelopeOffsets } from './multitrackClipEnvelopeSegments.js';
import { createMultitrackId } from './multitrackIds.js';
import { normalizeAutomation } from './multitrackAutomation.js';
import { normalizeTrackEffects } from './multitrackEffects.js';
import { normalizeMidiRegions } from './multitrackMidiRegion.js';
import { normalizeMarkers, normalizeSections } from './multitrackMarkers.js';

/** Project model v2: v1 projects migrate by gaining empty MIDI/marker vessels. */
export const MULTITRACK_PROJECT_VERSION = 2;

export function createMultitrackProject(input = {}) {
	return {
		version: MULTITRACK_PROJECT_VERSION,
		id: input.id || createMultitrackId('project'),
		title: String(input.title || 'Awtsmoos Mix'),
		tempo: positive(input.tempo,120),
		gridBeats: nonnegative(input.gridBeats,.25),
		markers: normalizeMarkers(input.markers),
		sections: normalizeSections(input.sections),
		tracks: (input.tracks || []).map(createMultitrackTrack)
	};
}

/** A track owns its absolute timeline automation, effects and non-destructive clip regions. */
export function createMultitrackTrack(input = {}) {
	return {
		id: input.id || createMultitrackId('track'),
		name: String(input.name || 'Audio Track'),
		gain: clamp(input.gain ?? 1,0,2),
		pan: clamp(input.pan ?? 0,-1,1),
		muted: Boolean(input.muted),
		solo: Boolean(input.solo),
		instrumentColor: String(input.instrumentColor || 'original'),
		effects: normalizeTrackEffects(input.effects),
		automation: { gain: normalizeAutomation(input.automation?.gain,'gain'), pan: normalizeAutomation(input.automation?.pan,'pan') },
		kind: input.kind === 'midi' ? 'midi' : 'audio',
		midiInstrument: String(input.midiInstrument || 'triangle'),
		clips: (input.clips || []).map(createMultitrackClip),
		midiRegions: normalizeMidiRegions(input.midiRegions)
	};
}

export function createMultitrackClip(input = {}) {
	const duration = positive(input.duration,.001);
	const offsets = readMultitrackClipEnvelopeOffsets(input);
	const fades = normalizeMultitrackClipFades(input.fadeIn,input.fadeOut,duration,offsets.fadeInOffset,offsets.fadeOutOffset);
	return {
		id: input.id || createMultitrackId('clip'),
		name: String(input.name || 'Audio Clip'),
		bufferId: String(input.bufferId || ''),
		timelineStart: nonnegative(input.timelineStart,0),
		sourceOffset: nonnegative(input.sourceOffset,0),
		duration,
		gain: clamp(input.gain ?? 1,0,2),
		fadeIn: fades.fadeIn,
		fadeOut: fades.fadeOut,
		fadeInOffset: offsets.fadeInOffset,
		fadeOutOffset: offsets.fadeOutOffset,
		loop: Boolean(input.loop)
	};
}

export function replaceMultitrackTrack(project,track) {
	return {...project,tracks:project.tracks.map(candidate=>candidate.id===track.id?track:candidate)};
}

export function findMultitrackTrack(project,trackId) {
	return project.tracks.find(track=>track.id===trackId)||null;
}

export function findMultitrackClip(project,clipId) {
	for(const track of project.tracks) {
		const clip=track.clips.find(candidate=>candidate.id===clipId);
		if(clip)return {track,clip};
	}
	return null;
}

/** Avoids argument-count limits on very large projects. */
export function multitrackProjectDuration(project) {
	let end=0;
	for(const track of project.tracks) {
		for(const clip of track.clips)end=Math.max(end,clip.timelineStart+clip.duration);
		for(const region of track.midiRegions||[])end=Math.max(end,region.timelineStart+region.duration);
	}
	return end;
}

export function findMultitrackMidiRegion(project,regionId) {
	for(const track of project.tracks) {
		const region=(track.midiRegions||[]).find(candidate=>candidate.id===regionId);
		if(region)return {track,region};
	}
	return null;
}

export function replaceMultitrackMidiRegion(project,region) {
	return {...project,tracks:project.tracks.map(track=>({
		...track,midiRegions:(track.midiRegions||[]).map(candidate=>candidate.id===region.id?region:candidate)
	}))};
}

function positive(value,fallback) {
	const number=Number(value);
	return Number.isFinite(number)&&number>0?number:fallback;
}
function nonnegative(value,fallback) {
	const number=Number(value);
	return Number.isFinite(number)&&number>=0?number:fallback;
}
function clamp(value,min,max) {
	const number=Number(value);
	return Math.max(min,Math.min(max,Number.isFinite(number)?number:min));
}
