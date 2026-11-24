//B"H
/** The Awtsmoos lets a melody remain editable — notes, not only frozen sound. */
import { createMultitrackId } from './multitrackIds.js';

const clampPitch = v => Math.max(0, Math.min(127, Math.round(Number(v) || 0)));
const clampVel = v => Math.max(1, Math.min(127, Math.round(Number.isFinite(Number(v)) ? Number(v) : 100)));
const nonneg = (v, f = 0) => Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : f;
const positive = (v, f) => Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : f;

/** One editable note; start/duration are seconds relative to its region. */
export function createMidiNote(input = {}) {
	return {
		id: input.id || createMultitrackId('note'),
		pitch: clampPitch(input.pitch ?? 60),
		start: nonneg(input.start),
		duration: positive(input.duration, .25),
		velocity: clampVel(input.velocity)
	};
}

/** One sustain-pedal interval, seconds relative to its region. */
export function createMidiSustain(input = {}) {
	return { start: nonneg(input.start), duration: positive(input.duration, .25) };
}

/** A versioned, non-destructive MIDI region living beside audio clips on a track. */
export function createMidiRegion(input = {}) {
	const notes = (input.notes || []).map(createMidiNote).sort((a, b) => a.start - b.start || a.pitch - b.pitch);
	const last = notes.reduce((end, n) => Math.max(end, n.start + n.duration), 0);
	return {
		id: input.id || createMultitrackId('midi'),
		name: String(input.name || 'MIDI Region'),
		timelineStart: nonneg(input.timelineStart),
		duration: positive(input.duration, Math.max(.25, last)),
		notes,
		sustain: (input.sustain || []).map(createMidiSustain).sort((a, b) => a.start - b.start)
	};
}

export function normalizeMidiRegions(input) {
	return Array.isArray(input) ? input.map(createMidiRegion) : [];
}

/** Returns a new region with one note added; the region grows to contain it. */
export function addMidiNote(region, noteInput) {
	const note = createMidiNote(noteInput);
	const duration = Math.max(region.duration, note.start + note.duration);
	return { region: createMidiRegion({ ...region, duration, notes: [...region.notes, note] }), note };
}

export function removeMidiNotes(region, ids) {
	const drop = new Set(ids || []);
	return createMidiRegion({ ...region, notes: region.notes.filter(n => !drop.has(n.id)) });
}

/** Moves selected notes by pitch steps and seconds, clamped inside the region/time. */
export function moveMidiNotes(region, ids, deltaPitch = 0, deltaStart = 0) {
	const chosen = new Set(ids || []);
	const notes = region.notes.map(n => chosen.has(n.id)
		? { ...n, pitch: clampPitch(n.pitch + deltaPitch), start: Math.max(0, n.start + deltaStart) } : n);
	const duration = Math.max(region.duration, ...notes.filter(n => chosen.has(n.id)).map(n => n.start + n.duration), 0);
	return createMidiRegion({ ...region, duration, notes });
}

export function resizeMidiNote(region, noteId, duration) {
	return createMidiRegion({ ...region, notes: region.notes.map(n => n.id === noteId
		? { ...n, duration: positive(duration, n.duration) } : n) });
}

export function setMidiNoteVelocity(region, noteId, velocity) {
	return createMidiRegion({ ...region, notes: region.notes.map(n => n.id === noteId
		? { ...n, velocity: clampVel(velocity) } : n) });
}

/** Duplicates selected notes at a time offset with fresh identities. */
export function duplicateMidiNotes(region, ids, offsetSeconds = 0) {
	const chosen = new Set(ids || []);
	const copies = region.notes.filter(n => chosen.has(n.id))
		.map(n => createMidiNote({ pitch: n.pitch, velocity: n.velocity, duration: n.duration, start: n.start + Math.max(0, offsetSeconds) }));
	if (!copies.length) return { region: createMidiRegion(region), copies: [] };
	const duration = Math.max(region.duration, ...copies.map(n => n.start + n.duration));
	return { region: createMidiRegion({ ...region, duration, notes: [...region.notes, ...copies] }), copies };
}

export function transposeMidiRegion(region, semitones = 0) {
	return createMidiRegion({ ...region, notes: region.notes.map(n => ({ ...n, pitch: clampPitch(n.pitch + semitones) })) });
}

/** Snaps note starts (and optionally durations) to a grid in seconds, e.g. beat = 60/tempo. */
export function quantizeMidiNotes(region, gridSeconds, quantizeDuration = false) {
	const grid = positive(gridSeconds, .25);
	const snap = v => Math.round(v / grid) * grid;
	return createMidiRegion({ ...region, notes: region.notes.map(n => ({
		...n, start: snap(n.start), duration: quantizeDuration ? Math.max(grid, snap(n.duration)) : n.duration
	})) });
}

/**
 * Expands a region to absolute timeline notes. A note whose end falls inside a
 * sustain interval is held until that interval ends — real pedal semantics.
 */
export function expandMidiRegionNotes(region, regionStart = region.timelineStart) {
	return region.notes.map(note => {
		let end = note.start + note.duration;
		for (const pedal of region.sustain || []) {
			if (note.start < pedal.start + pedal.duration && end > pedal.start && end <= pedal.start + pedal.duration)
				end = pedal.start + pedal.duration;
		}
		return { ...note, start: regionStart + note.start, duration: Math.max(.01, end - note.start), end: regionStart + end };
	}).sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

/** All absolute notes of a project, each tagged with its track and region. */
export function expandProjectMidiNotes(project) {
	const events = [];
	for (const track of project?.tracks || []) for (const region of track.midiRegions || [])
		for (const note of expandMidiRegionNotes(region)) events.push({ ...note, trackId: track.id, regionId: region.id });
	return events.sort((a, b) => a.start - b.start);
}

export function midiNoteFrequency(pitch) {
	return 440 * 2 ** ((clampPitch(pitch) - 69) / 12);
}
