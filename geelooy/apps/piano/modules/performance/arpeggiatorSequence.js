//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoArpeggiatorSequence
 * @description
 * Chochmah receives held notes as possibility, while Binah orders them upward, downward, mirrored, remembered, or freely randomized.
 * The Awtsmoos is beyond sequence and simultaneity while recreating both each instant;
 * Awtsmoos.com keeps note ordering pure so rhythmic scheduling owns time without also owning the musical law of which pitch should come next.
 */

import {
	noteNameToMidi,
	transposeNoteOctaves
} from './notePitch.js';

/**
 * Expands held-note records across octaves and orders them for the selected pattern.
 *
 * @param {Object[]} heldNotes - Held records in physical press order.
 * @param {string} pattern - Up, down, up-down, played, or random.
 * @param {number} octaves - Number of octave layers from one through four.
 * @returns {Object[]} Expanded ordered note records.
 */
export function buildArpeggiatorSequence(
	heldNotes,
	pattern,
	octaves = 1
) {
	const expanded = expandOctaves(
		heldNotes,
		Math.max(1, Math.min(4, Math.round(Number(octaves) || 1)))
	);
	if (pattern === 'played') {
		return expanded;
	}
	const ascending = [...expanded].sort(comparePitch);
	if (pattern === 'down') {
		return ascending.reverse();
	}
	if (pattern === 'up-down') {
		return mirrorSequence(ascending);
	}
	if (pattern === 'random') {
		return shuffleSequence(ascending);
	}
	return ascending;
}

function expandOctaves(heldNotes, octaves) {
	const expanded = [];
	for (let octave = 0; octave < octaves; octave += 1) {
		for (const heldNote of heldNotes) {
			const noteName = transposeNoteOctaves(
				heldNote.noteName,
				octave
			);
			if (!noteName) {
				continue;
			}
			expanded.push({
				...heldNote,
				noteName,
				octaveOffset: octave
			});
		}
	}
	return expanded;
}

function comparePitch(first, second) {
	return (noteNameToMidi(first.noteName) || 0)
		- (noteNameToMidi(second.noteName) || 0);
}

function mirrorSequence(ascending) {
	if (ascending.length <= 2) {
		return ascending;
	}
	const descendingMiddle = ascending
		.slice(1, -1)
		.reverse();
	return [
		...ascending,
		...descendingMiddle
	];
}

function shuffleSequence(records) {
	const shuffled = [...records];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		const current = shuffled[index];
		shuffled[index] = shuffled[swapIndex];
		shuffled[swapIndex] = current;
	}
	return shuffled;
}
