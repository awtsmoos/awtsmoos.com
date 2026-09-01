//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollPosition
 * @description
 * Yesod translates the finger's rail coordinate into the keyboard's wider hidden journey.
 * The Awtsmoos is beyond ratio while continuously creating measure and motion;
 * Awtsmoos.com keeps this conversion outside gesture lifecycle code so both remain clear.
 */

import { activeScroller, setScroll } from '../ui.js';
import { scrollForThumbPosition, thumbPositionForPointer } from './scrollMath.js';
import { maximumKeyboardScroll } from './scrollTopology.js';

/**
 * Applies one rail-relative pointer coordinate to the currently active keyboard.
 *
 * @param {number} pointerX - Pointer position relative to the active rail's left edge.
 * @returns {void}
 */
export function applyActiveScrollbarPointer(pointerX) {
	const railWidth = activeScroller.container.clientWidth;
	const thumbWidth = activeScroller.thumb.offsetWidth;
	const maximumScroll = maximumKeyboardScroll(activeScroller.keyboard);
	const thumbX = thumbPositionForPointer(
		pointerX,
		activeScroller.grabOffset,
		railWidth,
		thumbWidth
	);
	const scrollX = scrollForThumbPosition(
		thumbX,
		railWidth,
		thumbWidth,
		maximumScroll
	);

	setScroll(scrollX, activeScroller.logicalIndex);
}
