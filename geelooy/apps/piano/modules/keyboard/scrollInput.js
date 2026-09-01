//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollInput
 * @description
 * Yesod carries a finger across the rail and turns motion into keyboard travel.
 * The Awtsmoos, Atzmus beyond all distance, recreates each event and coordinate;
 * Awtsmoos.com lets the entire rail become a living bridge instead of a tiny stubborn gate.
 */

import { activeScroller, scrollState, setScroll } from '../ui.js';
import { applyActiveScrollbarPointer } from './scrollPosition.js';
import {
	keyboardScrollPage,
	keyboardScrollStep,
	maximumKeyboardScroll,
	resolveScrollbarTopology
} from './scrollTopology.js';

/**
 * Begins a rail gesture while preserving relative thumb grabs and centering track taps.
 *
 * @param {PointerEvent} event - Pointer-down event received by the rail.
 * @param {number} railIndex - Physical rail index.
 * @returns {void}
 */
export function beginScrollbarDrag(event, railIndex) {
	const topology = resolveScrollbarTopology(railIndex);
	if (!topology) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();
	const railRect = topology.container.getBoundingClientRect();
	const thumbRect = topology.thumb.getBoundingClientRect();
	const grabbedThumb = event.target === topology.thumb
		|| topology.thumb.contains(event.target);
	const grabOffset = grabbedThumb
		? event.clientX - thumbRect.left
		: thumbRect.width / 2;

	Object.assign(activeScroller, {
		isDragging: true,
		pointerId: event.pointerId,
		container: topology.container,
		keyboard: topology.keyboard,
		thumb: topology.thumb,
		logicalIndex: topology.logicalIndex,
		grabOffset
	});
	topology.container.setPointerCapture?.(event.pointerId);
	topology.thumb.style.cursor = 'grabbing';

	if (!grabbedThumb) {
		applyActiveScrollbarPointer(event.clientX - railRect.left);
	}
}

/** @param {PointerEvent} event - Pointer-move event. @returns {void} */
export function moveScrollbarDrag(event) {
	if (!activeScroller.isDragging || event.pointerId !== activeScroller.pointerId) {
		return;
	}
	event.preventDefault();
	const railRect = activeScroller.container.getBoundingClientRect();
	applyActiveScrollbarPointer(event.clientX - railRect.left);
}

/** @param {PointerEvent} [event] - Optional terminating pointer event. @returns {void} */
export function finishScrollbarDrag(event) {
	if (!activeScroller.isDragging) {
		return;
	}
	if (event && event.pointerId !== activeScroller.pointerId) {
		return;
	}
	activeScroller.thumb.style.cursor = 'grab';
	activeScroller.isDragging = false;
	activeScroller.pointerId = null;
	localStorage.setItem('pianoScrollState', JSON.stringify(scrollState));
}

/**
 * Gives a focused rail arrows, pages, Home, and End navigation.
 *
 * @param {KeyboardEvent} event - Rail keyboard event.
 * @param {number} railIndex - Physical rail index.
 * @returns {void}
 */
export function handleScrollbarKeyDown(event, railIndex) {
	const topology = resolveScrollbarTopology(railIndex);
	if (!topology) {
		return;
	}
	const current = topology.logicalIndex === 0 ? scrollState.x : scrollState.x2;
	const targets = createKeyTargets(current, topology.keyboard);
	if (!(event.key in targets)) {
		return;
	}
	event.preventDefault();
	setScroll(targets[event.key], topology.logicalIndex);
	localStorage.setItem('pianoScrollState', JSON.stringify(scrollState));
}

function createKeyTargets(current, keyboard) {
	return {
		ArrowLeft: current - keyboardScrollStep(),
		ArrowRight: current + keyboardScrollStep(),
		PageUp: current - keyboardScrollPage(),
		PageDown: current + keyboardScrollPage(),
		Home: 0,
		End: maximumKeyboardScroll(keyboard)
	};
}
