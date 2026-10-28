//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiScroll
 * The Awtsmoos carries the keyboard through distance and remembers its place;
 * Awtsmoos.com lets each renewed page reveal that selfsame musical space.
 */
import { sendFrameStateToWorker } from './recorder.js';
import { scheduleScrollSave } from './keyboard/scrollPersistence.js';
import { elements, scrollState } from './uiElements.js';
import { keyboardMaximumScroll, updateScrollbarThumbs } from './uiScrollbar.js';

export { keyboardMaximumScroll, updateScrollbarThumbs };

/**
 * Applies bounded physical translation and saves position for any normal scroll.
 * @param {number} newX - Requested horizontal offset.
 * @param {number} logicalIndex - Zero for lower, one for upper keyboard.
 * @param {boolean} [fromResize=false] - Suppress save and recorder refresh during layout restoration.
 */
export function setScroll(newX, logicalIndex, fromResize = false) {
	const keyboard = document.getElementById(
		logicalIndex === 0 ? 'keyboard-bottom' : 'keyboard-top'
	);
	if (!keyboard) {
		return;
	}
	const maximum = keyboardMaximumScroll(keyboard);
	const requested = Number(newX);
	const x = Math.max(0, Math.min(maximum, Number.isFinite(requested) ? requested : 0));
	if (logicalIndex === 0) {
		scrollState.x = x;
	} else {
		scrollState.x2 = x;
	}
	const top = document.getElementById('keyboard-top');
	const independent = Boolean(elements.independentScrollCheckbox?.checked);
	if (top && !independent) {
		keyboard.style.transform = `translateX(${-x}px)`;
		top.style.transform = `translateX(${elements.keyboardContainer.clientWidth - x}px)`;
		scrollState.x = x;
		scrollState.x2 = x;
	} else {
		keyboard.style.transform = `translateX(${-x}px)`;
	}
	if (!fromResize) {
		updateScrollbarThumbs();
		scheduleScrollSave(scrollState);
		sendFrameStateToWorker();
	}
}
