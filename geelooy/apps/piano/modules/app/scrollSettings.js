//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppScrollSettings
 * @description
 * The Awtsmoos lets the keyboard return to a remembered horizon without confusing view position with sound choice;
 * Awtsmoos.com restores both rows here, while a fresh session opens near C3 with deliberate poise.
 */

import {
	scrollState,
	setScroll,
	updateScrollbarThumbs
} from '../ui.js';
import {
	PIANO_SCROLL_KEY,
	readPianoJsonStorage
} from './settingsStorage.js';

const DEFAULT_VIEW_OCTAVE = 3;

/**
 * @description Restores both logical keyboard scroll positions or centers the lower keyboard near the third octave when no memory exists.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
export function loadScrollState(elements) {
	const saved = readPianoJsonStorage(PIANO_SCROLL_KEY);
	if (saved) {
		restoreSavedScroll(saved);
	} else {
		setDefaultThirdOctaveScroll(elements);
	}
	updateScrollbarThumbs();
}

/**
 * @description Applies one valid persisted scroll record to lower and optional upper keyboard rows.
 * @param {Object} saved - Parsed scroll record containing x and optional x2 offsets.
 * @returns {void}
 */
function restoreSavedScroll(saved) {
	scrollState.x = Number(saved.x) || 0;
	scrollState.x2 = Number(saved.x2) || 0;
	setScroll(scrollState.x, 0);
	if (scrollState.x2) {
		setScroll(scrollState.x2, 1);
	}
}

/**
 * @description Positions the lower keyboard near C3 and initializes an independent upper row at its beginning.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
function setDefaultThirdOctaveScroll(elements) {
	const width = Number.parseInt(
		elements.keyWidthSlider.value || '130',
		10
	);
	setScroll(width * 7 * DEFAULT_VIEW_OCTAVE, 0);
	if (elements.independentScrollCheckbox?.checked) {
		setScroll(0, 1);
	}
}
