//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiScroll
 * @description
 * Netzach carries the keyboard through horizontal space while the Awtsmoos recreates both motion and resting place.
 * Awtsmoos.com keeps command, bounds, mirrored dual rows, and recorder refresh here,
 * while the separate scrollbar vessel reveals that motion without swelling this coordinator beyond its proper measure.
 */

import { sendFrameStateToWorker } from './recorder.js';
import {
	elements,
	scrollState
} from './uiElements.js';
import {
	keyboardMaximumScroll,
	updateScrollbarThumbs
} from './uiScrollbar.js';

export {
	keyboardMaximumScroll,
	updateScrollbarThumbs
};

/**
 * Applies one bounded logical keyboard scroll position.
 *
 * @param {number} newX - Requested horizontal offset.
 * @param {number} logicalIndex - Zero for bottom, one for top.
 * @param {boolean} [fromResize=false] - Whether resize is restoring position.
 * @returns {void}
 */
export function setScroll(newX, logicalIndex, fromResize = false) {
	const keyboard = logicalKeyboard(logicalIndex);
	if (!keyboard) {
		return;
	}
	const maximum = keyboardMaximumScroll(keyboard);
	const x = Math.max(0, Math.min(maximum, Number(newX) || 0));
	setLogicalState(logicalIndex, x);
	const top = document.getElementById('keyboard-top');
	const independent = elements.independentScrollCheckbox.checked;
	if (top && !independent) {
		applyMirroredScroll(keyboard, top, x, fromResize);
	} else {
		keyboard.style.transform = `translateX(${-x}px)`;
	}
	if (!fromResize) {
		updateScrollbarThumbs();
		sendFrameStateToWorker();
	}
}

function logicalKeyboard(index) {
	return document.getElementById(
		index === 0 ? 'keyboard-bottom' : 'keyboard-top'
	);
}

function setLogicalState(index, x) {
	if (index === 0) {
		scrollState.x = x;
	} else {
		scrollState.x2 = x;
	}
}

function applyMirroredScroll(keyboard, top, x, fromResize) {
	keyboard.style.transform = `translateX(${-x}px)`;
	top.style.transform = `translateX(${elements.keyboardContainer.clientWidth - x}px)`;
	if (!fromResize) {
		scrollState.x = x;
		scrollState.x2 = x;
	}
}
