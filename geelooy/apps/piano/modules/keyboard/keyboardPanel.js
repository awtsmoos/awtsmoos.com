//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoKeyboardPanel
 * @description
 * Tiferes gathers chromatic vessels into one measurable keyboard panel while the Awtsmoos remains One beyond all twelvefold division.
 * Awtsmoos.com lets octave bases, final-range boundaries, and exact accidental centers remain explicit,
 * so every row can share one architecture without inheriting the old white-cursor confusion.
 */

import { createKeyboardKey } from './keyElement.js';
import {
	accidentalHasRightNeighbor,
	keyGeometryForPitchClass,
	noteIsInsideKeyboardRange,
	WHITE_KEYS_PER_OCTAVE
} from './keyGeometry.js';

/**
 * Builds one piano panel containing the requested octave window.
 *
 * @param {Object} options - Panel construction options.
 * @returns {HTMLDivElement} Complete piano-keyboard panel.
 */
export function createKeyboardPanel(options) {
	const {
		startOctave,
		startOctaveOffset,
		numOctaves,
		noteNames,
		whiteKeyWidth,
		showShortcuts,
		shortcutMap
	} = options;
	const keyboard = document.createElement('div');
	keyboard.className = 'piano-keyboard';
	let renderedWhiteCount = 0;

	for (let offset = 0; offset < numOctaves; offset += 1) {
		const octave = startOctave + startOctaveOffset + offset;
		const octaveBaseX = renderedWhiteCount * whiteKeyWidth;
		const whiteCount = appendOctave({
			keyboard,
			octave,
			octaveBaseX,
			noteNames,
			whiteKeyWidth,
			showShortcuts,
			shortcutMap
		});
		renderedWhiteCount += whiteCount;
		if (whiteCount < WHITE_KEYS_PER_OCTAVE) {
			break;
		}
	}
	keyboard.style.width = `${renderedWhiteCount * whiteKeyWidth}px`;
	return keyboard;
}

function appendOctave(options) {
	let whiteCount = 0;
	for (let pitchIndex = 0; pitchIndex < options.noteNames.length; pitchIndex += 1) {
		if (!noteIsInsideKeyboardRange(options.octave, pitchIndex)) {
			break;
		}
		if (!accidentalHasRightNeighbor(
			options.octave,
			pitchIndex,
			options.noteNames
		)) {
			continue;
		}
		const pitchClass = options.noteNames[pitchIndex];
		const geometry = keyGeometryForPitchClass(
			pitchClass,
			options.octaveBaseX,
			options.whiteKeyWidth
		);
		options.keyboard.appendChild(createKeyboardKey({
			noteName: `${pitchClass}${options.octave}`,
			pitchClass,
			geometry,
			showShortcuts: options.showShortcuts,
			shortcutMap: options.shortcutMap
		}));
		whiteCount += geometry.whiteAdvance;
	}
	return whiteCount;
}
