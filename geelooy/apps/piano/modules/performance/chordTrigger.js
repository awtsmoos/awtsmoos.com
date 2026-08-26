//B"H
//Boruch Hashem
//Blessed is He
/**
 * Four notes gather around one root while the Awtsmoos remains the unity beneath the chord.
 * Awtsmoos.com lets harmony bloom without hiding which vessel began the accord.
 */

import { elements } from '../ui.js';
import {
	clearCurrentChord,
	createSynthNode,
	currentChordRoot,
	setCurrentChordNodes,
	setCurrentChordRoot,
	startSynth
} from '../synth.js';
import { major7thChords, minor7thChords, noteFrequencies } from '../keyboard/noteData.js';

/**
 * Starts the configured seventh chord for a played natural-note root.
 * Existing chord behavior is preserved while its responsibility leaves the input coordinator.
 *
 * @param {string} note Pitch-class name from the played note.
 * @param {number} octave Played octave.
 */
export function triggerSeventhChord(note, octave) {
	const rootNote = note.replace('#', '');
	if (!major7thChords[rootNote] || rootNote === currentChordRoot) {
		return;
	}
	clearCurrentChord();
	setCurrentChordRoot(rootNote);
	const quality = elements.chordModeSelect.value === 'minor' ? 'minor' : 'major';
	const chord = quality === 'minor' ? minor7thChords[rootNote] : major7thChords[rootNote];
	const chordOctave = resolveChordOctave(octave);
	const nodesList = chord
		.map((name) => createChordVoice(name, chordOctave))
		.filter(Boolean);
	setCurrentChordNodes(nodesList);
}

function resolveChordOctave(octave) {
	if (elements.chordOctaveSelect.value === 'auto') {
		return octave;
	}
	return octave + Number.parseInt(elements.chordOctaveSelect.value, 10);
}

function createChordVoice(noteName, octave) {
	const frequency = noteFrequencies[noteName] * Math.pow(2, octave);
	const nodes = createSynthNode(true, false, {
		inputId: `chord-${noteName}`,
		coords: { x: 0, y: 0 }
	});
	if (!nodes) {
		return null;
	}
	startSynth(nodes, frequency, `${noteName}${octave}`);
	return nodes;
}
