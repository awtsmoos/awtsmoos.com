//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongModel
 * @description
 * Yesod gives recorded time one honest vessel while the Awtsmoos remains beyond before and after.
 * Awtsmoos.com keeps every note finite, sorted, and reproducible so a human-written scroll may become sound again without losing its source.
 */

export const SONG_VERSION = 1;
export const DEFAULT_TEMPO = 120;
export const DEFAULT_BEATS_PER_BAR = 4;
export const DEFAULT_GRID = 0.25;

/** Creates one validated song snapshot. @param {Object} input Candidate song. @returns {Object} Canonical song. */
export function createSong(input = {}) {
	const events = (input.events || []).map(normalizeSongEvent).sort(compareEvents);
	const markers = (input.markers || []).map(normalizeMarker).sort((a, b) => a.beat - b.beat);
	return {
		version: SONG_VERSION,
		title: String(input.title || 'Untitled Take').trim() || 'Untitled Take',
		tempo: positiveNumber(input.tempo, DEFAULT_TEMPO),
		beatsPerBar: positiveNumber(input.beatsPerBar, DEFAULT_BEATS_PER_BAR),
		grid: positiveNumber(input.grid, DEFAULT_GRID),
		events,
		markers
	};
}

/** Validates one note event. @param {Object} event Event candidate. @returns {Object} Canonical event. */
export function normalizeSongEvent(event) {
	return {
		start: nonnegativeNumber(event.start, 'start'),
		duration: positiveNumberOrThrow(event.duration, 'duration'),
		note: normalizePitch(event.note),
		velocity: clamp(Number(event.velocity ?? 0.82), 0, 1)
	};
}

/** Normalizes common enharmonic spellings to the sharp-oriented piano vocabulary. @param {string} pitch Candidate pitch. @returns {string} Canonical pitch. */
export function normalizePitch(pitch) {
	const match = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(String(pitch || '').trim());
	if (!match) {
		throw new Error(`Invalid pitch: ${pitch}`);
	}
	const letter = match[1].toUpperCase();
	const accidental = match[2];
	const octave = Number(match[3]);
	return canonicalEnharmonic(letter, accidental, octave);
}

function canonicalEnharmonic(letter, accidental, octave) {
	if (accidental === 'b') {
		const flats = {
			A: ['G#', octave], B: ['A#', octave], C: ['B', octave - 1],
			D: ['C#', octave], E: ['D#', octave], F: ['E', octave], G: ['F#', octave]
		};
		return boundedPitch(...flats[letter]);
	}
	if (accidental === '#' && letter === 'E') {
		return boundedPitch('F', octave);
	}
	if (accidental === '#' && letter === 'B') {
		return boundedPitch('C', octave + 1);
	}
	return boundedPitch(`${letter}${accidental}`, octave);
}

function boundedPitch(name, octave) {
	if (!Number.isInteger(octave) || octave < 0 || octave > 8) {
		throw new Error(`Pitch octave out of range: ${name}${octave}`);
	}
	return `${name}${octave}`;
}

function normalizeMarker(marker) {
	return {
		beat: nonnegativeNumber(marker.beat, 'marker beat'),
		label: String(marker.label || 'MARK').trim() || 'MARK'
	};
}

function compareEvents(a, b) {
	return a.start - b.start || a.note.localeCompare(b.note);
}

function nonnegativeNumber(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new Error(`${label} must be a nonnegative number`);
	}
	return number;
}

function positiveNumberOrThrow(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new Error(`${label} must be a positive number`);
	}
	return number;
}

function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}
