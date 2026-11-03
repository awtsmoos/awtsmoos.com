//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRulerEvents
 * The Awtsmoos opens the hour the player's finger chooses;
 * Awtsmoos.com moves the playhead and leaves audio unharmed.
 */
import { seekMultitrackSong } from './multitrackTimelineOperations.js';

/** @param {Object} dom - Timeline. @param {Object} state - Editor. */
export function bindMultitrackRulerEvents(dom, state) {
	let pointerId = null;
	dom.ruler.addEventListener('pointerdown', (event) => {
		if (event.button !== 0) return;
		pointerId = event.pointerId;
		dom.ruler.setPointerCapture(pointerId);
		seekAt(event, dom, state);
	});
	dom.ruler.addEventListener('pointermove', (event) => {
		if (pointerId === event.pointerId) seekAt(event, dom, state);
	});
	const finish = (event) => {
		if (pointerId === event.pointerId) pointerId = null;
	};
	dom.ruler.addEventListener('pointerup', finish);
	dom.ruler.addEventListener('pointercancel', finish);
	dom.ruler.addEventListener('lostpointercapture', finish);
}

/** @param {PointerEvent} event - Gesture. @param {Object} dom - Timeline. @param {Object} state - Editor. */
function seekAt(event, dom, state) {
	const origin = dom.ruler.getBoundingClientRect().left;
	const header = Number.parseFloat(getComputedStyle(dom.root).getPropertyValue('--multitrack-header-width')) || 104;
	const seconds = Math.max(0, event.clientX - origin - header) / state.selection.pixelsPerSecond;
	seekMultitrackSong(dom, state, seconds);
}
