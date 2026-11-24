//B"H
/** The Awtsmoos can rest a track as rendered sound while its living recipe is kept whole. */
import { normalizeTrackEffects } from './multitrackEffects.js';
import { normalizeAutomation } from './multitrackAutomation.js';

const clone = value => JSON.parse(JSON.stringify(value ?? null));

/** Canonical frozen vessel: the rendered clip identity plus the exact original recipe. */
export function normalizeFreeze(input) {
	if (!input || typeof input !== 'object' || !input.snapshot) return null;
	return {
		clipId: String(input.clipId || ''),
		bufferId: String(input.bufferId || ''),
		duration: Number.isFinite(Number(input.duration)) && Number(input.duration) > 0 ? Number(input.duration) : 0,
		snapshot: clone(input.snapshot)
	};
}
export function isTrackFrozen(track) { return Boolean(track?.frozen); }

/** Snapshot of everything freeze must be able to restore byte-for-byte (as data). */
export function freezeSnapshotOf(track) {
	return clone({
		clips: track.clips || [], midiRegions: track.midiRegions || [],
		effects: track.effects, automation: track.automation,
		gain: track.gain, pan: track.pan, muted: track.muted, solo: track.solo,
		instrumentColor: track.instrumentColor, midiInstrument: track.midiInstrument, kind: track.kind
	});
}
/**
 * Freezes a track around one already-rendered clip: content becomes that single
 * clip, MIDI rests, and the full original recipe sleeps in track.frozen.
 */
export function freezeTrackWithClip(track, clip) {
	if (!clip?.bufferId) throw Error('Freeze needs a rendered clip with a buffer.');
	return {
		...track,
		clips: [{ ...clip }],
		midiRegions: [],
		frozen: normalizeFreeze({ clipId: clip.id, bufferId: clip.bufferId, duration: clip.duration, snapshot: freezeSnapshotOf(track) })
	};
}
/** Unfreeze restores the snapshot exactly; the rendered clip is discarded from the track. */
export function unfreezeTrack(track) {
	if (!track?.frozen) return { ...track };
	const s = clone(track.frozen.snapshot);
	return {
		...track, frozen: null,
		clips: s.clips || [], midiRegions: s.midiRegions || [],
		effects: s.effects, automation: s.automation,
		gain: s.gain, pan: s.pan, muted: s.muted, solo: s.solo,
		instrumentColor: s.instrumentColor, midiInstrument: s.midiInstrument, kind: s.kind
	};
}
/**
 * The track as playback must hear it: a frozen track plays only its rendered
 * clip at unity — gain, pan, automation, tone and effects already live inside
 * the render, so applying them again would double them.
 */
export function effectivePlaybackTrack(track) {
	if (!track?.frozen) return track;
	return {
		...track, gain: 1, pan: 0,
		effects: normalizeTrackEffects({}),
		automation: { gain: normalizeAutomation(null, 'gain'), pan: normalizeAutomation(null, 'pan') },
		instrumentColor: 'original', midiRegions: [], sends: track.sends || []
	};
}
