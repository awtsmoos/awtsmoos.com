//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos lets a wide keyboard travel beneath a narrow window without losing its place.
 * Awtsmoos.com keeps mirrored and independent scroll vessels ordered with measured grace.
 */

import { activeScroller, elements, scrollState, setScroll } from '../ui.js';

/** Begins dragging one custom keyboard scrollbar thumb. */
export function beginScrollbarDrag(event, index) {
	event.preventDefault();
	event.stopPropagation();
	const thumb = event.target;
	const container = thumb.parentElement;
	const isDual = Boolean(document.getElementById('keyboard-top'));
	const isIndependent = elements.independentScrollCheckbox.checked;
	const logicalIndex = isDual && isIndependent && index === 0 ? 1 : 0;
	if ((!isDual && index === 1) || (isDual && !isIndependent && index === 1)) {
		return;
	}
	const keyboard = logicalIndex === 0
		? document.getElementById('keyboard-bottom')
		: document.getElementById('keyboard-top');
	if (!keyboard) {
		return;
	}
	activeScroller.isDragging = true;
	activeScroller.index = index;
	activeScroller.thumb = thumb;
	activeScroller.startX = event.clientX;
	activeScroller.startThumbX = thumb.offsetLeft;
	activeScroller.scrollRatio = (keyboard.offsetWidth - elements.keyboardContainer.clientWidth)
		/ (container.clientWidth - thumb.offsetWidth);
	activeScroller.logicalIndex = logicalIndex;
	thumb.setPointerCapture(event.pointerId);
	thumb.style.cursor = 'grabbing';
}

/** Moves the active scrollbar drag and translates thumb distance into keyboard scroll. */
export function moveScrollbarDrag(event) {
	if (!activeScroller.isDragging) {
		return;
	}
	event.preventDefault();
	const deltaX = event.clientX - activeScroller.startX;
	const container = activeScroller.thumb.parentElement;
	const maximum = container.clientWidth - activeScroller.thumb.offsetWidth;
	const thumbPosition = Math.max(0, Math.min(maximum, activeScroller.startThumbX + deltaX));
	setScroll(thumbPosition * activeScroller.scrollRatio, activeScroller.logicalIndex);
}

/** Finishes an active drag and persists the current split-scroll state. */
export function finishScrollbarDrag() {
	if (!activeScroller.isDragging) {
		return;
	}
	activeScroller.thumb.style.cursor = 'grab';
	activeScroller.isDragging = false;
	localStorage.setItem('pianoScrollState', JSON.stringify(scrollState));
}
