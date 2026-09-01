//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetQuantize
 * @description
 * Gevurah receives fluid performance time and gives it the nearest readable rhythmic vessel.
 * The Awtsmoos is beyond before and after while recreating every instant;
 * Awtsmoos.com turns held sound and measured silence into notation without mutating the player's remembered line.
 */

import {
	NOTATION_DURATIONS,
	QUARTER_NOTE_SECONDS
} from './constants.js';

/**
 * Converts recorded piano notes into quantized note/rest events.
 *
 * @param {Object[]} notes - Recorded notes with note, start, and duration fields.
 * @returns {Object[]} Quantized notation events sorted by start time.
 */
export function quantizeNotes(notes) {
	if (!Array.isArray(notes) || notes.length === 0) {
		return [];
	}

	const sortedNotes = [...notes].sort((left, right) => {
		return left.start - right.start;
	});
	const result = [];
	let lastEndTime = sortedNotes[0].start;

	for (const note of sortedNotes) {
		appendRests(result, lastEndTime, note.start);
		const closestDuration = nearestDuration(note.duration);
		result.push(createQuantizedNote(note, closestDuration));
		lastEndTime = Math.max(
			lastEndTime,
			note.start + closestDuration.duration
		);
	}

	return result;
}

function appendRests(result, previousEnd, nextStart) {
	let remaining = nextStart - previousEnd;
	if (remaining <= NOTATION_DURATIONS[0].duration * 0.8) {
		return;
	}
	let restStart = previousEnd;
	while (remaining >= NOTATION_DURATIONS[0].duration * 0.9) {
		const chosen = largestFittingDuration(remaining);
		result.push({
			type: 'rest',
			duration: chosen.name,
			value: chosen.duration,
			start: restStart
		});
		remaining -= chosen.duration;
		restStart += chosen.duration;
	}
}

function largestFittingDuration(remaining) {
	let chosen = NOTATION_DURATIONS[0];
	for (let index = NOTATION_DURATIONS.length - 1; index >= 0; index -= 1) {
		if (NOTATION_DURATIONS[index].duration <= remaining * 1.1) {
			chosen = NOTATION_DURATIONS[index];
			break;
		}
	}
	return chosen;
}

function nearestDuration(duration) {
	return NOTATION_DURATIONS.reduce((closest, candidate) => {
		const candidateDelta = Math.abs(candidate.duration - duration);
		const closestDelta = Math.abs(closest.duration - duration);
		return candidateDelta < closestDelta ? candidate : closest;
	});
}

function createQuantizedNote(note, closestDuration) {
	const staccato = note.duration < closestDuration.duration * 0.6
		&& closestDuration.duration > QUARTER_NOTE_SECONDS / 4;
	return {
		type: 'note',
		pitch: note.note,
		start: note.start,
		duration: closestDuration.name,
		value: closestDuration.duration,
		articulation: staccato ? 'staccato' : null
	};
}
