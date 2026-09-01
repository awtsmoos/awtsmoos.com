//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetVoiceMeasures
 * @description
 * Yesod gathers a single staff voice into bounded measures, remembering local accidentals and simultaneous tones.
 * The Awtsmoos is beyond division while creating each bar and chord anew;
 * Awtsmoos.com lets many notes share ordered vessels so the written line can faithfully show.
 */

import { beatValue } from './constants.js';
import { getNoteDetails } from './noteDetails.js';

/**
 * Builds measures and chord groups for one treble or bass voice.
 *
 * @param {Object[]} voiceNotes - Quantized events assigned to one staff.
 * @param {number} beatsPerMeasure - Time-signature numerator.
 * @param {Object} keySignature - Inferred key signature.
 * @returns {Object[]} Structured measure records.
 */
export function buildVoiceMeasures(voiceNotes, beatsPerMeasure, keySignature) {
	const measures = [];
	let currentMeasure = createMeasure();
	let measureAccidentals = new Set();

	for (const sourceItem of voiceNotes) {
		const item = { ...sourceItem };
		const itemBeats = beatValue(item.value);
		if (shouldCloseMeasure(currentMeasure, itemBeats, beatsPerMeasure)) {
			measures.push(finalizeMeasure(currentMeasure));
			currentMeasure = createMeasure();
			measureAccidentals = new Set();
		}
		if (item.type === 'note') {
			decorateAccidental(item, keySignature, measureAccidentals);
		}
		currentMeasure.items.push(item);
		currentMeasure.beats += itemBeats;
	}

	if (currentMeasure.items.length > 0) {
		measures.push(finalizeMeasure(currentMeasure));
	}
	return measures;
}

function createMeasure() {
	return {
		items: [],
		beats: 0
	};
}

function shouldCloseMeasure(measure, nextBeats, beatsPerMeasure) {
	return measure.items.length > 0
		&& measure.beats + nextBeats > beatsPerMeasure + 0.1;
}

function decorateAccidental(item, keySignature, measureAccidentals) {
	const details = getNoteDetails(item.pitch);
	item.details = details;
	item.displayAccidental = null;
	const naturalPitch = `${details.baseNote}${details.octave}`;
	const keyAccidental = keySignature.accidentals.find((accidental) => {
		return accidental.startsWith(details.baseNote);
	});

	if (details.accidental) {
		const namedAccidental = `${details.baseNote}${details.accidental}`;
		if (!keySignature.accidentals.includes(namedAccidental)
			&& !measureAccidentals.has(item.pitch)) {
			item.displayAccidental = details.accidental;
			measureAccidentals.add(item.pitch);
		}
		return;
	}
	if (keyAccidental && !measureAccidentals.has(naturalPitch)) {
		item.displayAccidental = '♮';
		measureAccidentals.add(naturalPitch);
	}
}

function finalizeMeasure(measure) {
	measure.beatStructure = groupSimultaneousItems(measure.items);
	return measure;
}

function groupSimultaneousItems(items) {
	const groups = [];
	for (let index = 0; index < items.length;) {
		const first = items[index];
		const group = [first];
		if (first.type === 'note') {
			collectChordFollowers(items, index, group);
			group.sort((left, right) => {
				return left.details.pitchValue - right.details.pitchValue;
			});
		}
		groups.push(group);
		index += group.length;
	}
	return groups;
}

function collectChordFollowers(items, startIndex, group) {
	const first = items[startIndex];
	for (let index = startIndex + 1; index < items.length; index += 1) {
		const candidate = items[index];
		if (candidate.type !== 'note' || Math.abs(candidate.start - first.start) >= 0.05) {
			break;
		}
		group.push(candidate);
	}
}
