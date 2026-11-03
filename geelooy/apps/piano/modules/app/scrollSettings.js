//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppScrollSettings
 * The Awtsmoos remembers every octave without needing a remembered place;
 * Awtsmoos.com restores a player's horizon when the keyboard comes to grace.
 */
import { scrollState, setScroll, updateScrollbarThumbs } from '../ui.js';
import { sanitizeScrollOffset } from '../keyboard/scrollPersistence.js';
import { PIANO_SCROLL_KEY, readPianoJsonStorage } from './settingsStorage.js';

const DEFAULT_VIEW_OCTAVE = 3;

/**
 * Restores saved offsets after the keyboard becomes visible and measurable.
 * @param {Object} elements - Cached keyboard controls.
 */
export function loadScrollState(elements) {
	const saved = readPianoJsonStorage(PIANO_SCROLL_KEY);
	const independent = Boolean(elements.independentScrollCheckbox?.checked);
	if (saved) {
		setScroll(sanitizeScrollOffset(saved.x), 0, true);
		if (independent) {
			setScroll(sanitizeScrollOffset(saved.x2), 1, true);
		}
	} else {
		const width = Number.parseFloat(elements.keyWidthSlider?.value || '130');
		const defaultX = (Number.isFinite(width) ? width : 130) * 7 * DEFAULT_VIEW_OCTAVE;
		setScroll(defaultX, 0, true);
		if (independent) {
			setScroll(0, 1, true);
		}
	}
	if (!independent) {
		scrollState.x2 = scrollState.x;
	}
	updateScrollbarThumbs();
}
