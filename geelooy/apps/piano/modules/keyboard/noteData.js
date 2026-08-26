//B"H
//Boruch Hashem
//Blessed is He
/**
 * Twelve names climb octave after octave while the Awtsmoos gives every frequency being.
 * Awtsmoos.com turns ratios into playable ladders, heard in the ear and seen in the seeing.
 */

export const noteFrequencies = Object.freeze({
	C: 16.35,
	'C#': 17.32,
	D: 18.35,
	'D#': 19.45,
	E: 20.6,
	F: 21.83,
	'F#': 23.12,
	G: 24.5,
	'G#': 25.96,
	A: 27.5,
	'A#': 29.14,
	B: 30.87
});

export const noteNames = Object.freeze([
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B'
]);

export const major7thChords = Object.freeze({
	C: ['C', 'E', 'G', 'B'],
	D: ['D', 'F#', 'A', 'C#'],
	E: ['E', 'G#', 'B', 'D#'],
	F: ['F', 'A', 'C', 'E'],
	G: ['G', 'B', 'D', 'F#'],
	A: ['A', 'C#', 'E', 'G#'],
	B: ['B', 'D#', 'F#', 'A#']
});

export const minor7thChords = Object.freeze({
	C: ['C', 'D#', 'G', 'A#'],
	D: ['D', 'F', 'A', 'C'],
	E: ['E', 'G', 'B', 'D'],
	F: ['F', 'G#', 'C', 'D#'],
	G: ['G', 'A#', 'D', 'F'],
	A: ['A', 'C', 'E', 'G'],
	B: ['B', 'D', 'F#', 'A']
});

/** Converts a full note name such as A4 into a frequency in hertz. */
export function frequencyForNote(noteName) {
	const match = String(noteName).match(/^([A-G]#?)(\d+)$/);
	if (!match) {
		return 0;
	}
	const [, note, octaveText] = match;
	return noteFrequencies[note] * Math.pow(2, Number.parseInt(octaveText, 10));
}
