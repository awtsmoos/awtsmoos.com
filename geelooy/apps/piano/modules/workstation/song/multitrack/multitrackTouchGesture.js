//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTouchGesture
 * The Awtsmoos knows whether the hand intends to travel or to shape;
 * Awtsmoos.com distinguishes touch swipes from a deliberate held clip.
 */

const HOLD_DELAY_MS = 300;
const MOVE_THRESHOLD_PX = 9;

/** @param {PointerEvent} event - Starting pointer. @param {Object} options - Clip, viewport and transform details. */
export function beginMultitrackGesture(event, options) {
	const touch = event.pointerType === 'touch';
	const gesture = {
		...options,
		pointerId: event.pointerId,
		originX: event.clientX,
		originY: event.clientY,
		startScrollLeft: options.viewport.scrollLeft,
		startScrollTop: options.viewport.scrollTop,
		phase: touch && options.mode === 'move' ? 'pending' : 'drag',
		changed: false,
		holdTimer: null
	};
	if (gesture.phase === 'pending') {
		gesture.holdTimer = setTimeout(() => {
			if (gesture.phase === 'pending') activateDrag(gesture);
		}, HOLD_DELAY_MS);
	} else {
		activateDrag(gesture);
	}
	return gesture;
}

/** @param {Object} gesture - Active pointer. @param {PointerEvent} event - Next position. @returns {boolean} Whether audio should move. */
export function updateMultitrackTouchGesture(gesture, event) {
	const deltaX = event.clientX - gesture.originX;
	const deltaY = event.clientY - gesture.originY;
	if (gesture.phase === 'pending' && Math.hypot(deltaX, deltaY) > MOVE_THRESHOLD_PX) {
		clearTimeout(gesture.holdTimer);
		gesture.phase = 'pan';
	}
	if (gesture.phase === 'pan') {
		gesture.viewport.scrollLeft = gesture.startScrollLeft - deltaX;
		gesture.viewport.scrollTop = gesture.startScrollTop - deltaY;
		return false;
	}
	if (gesture.phase !== 'drag') return false;
	gesture.changed ||= Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1;
	return gesture.changed;
}

/** @param {Object} gesture - Current gesture, or null. */
export function finishMultitrackGesture(gesture) {
	if (!gesture) return;
	clearTimeout(gesture.holdTimer);
	gesture.element.classList.remove('multitrack-clip-dragging');
}

/** @param {Object} gesture - Completed deliberate hold. */
function activateDrag(gesture) {
	gesture.phase = 'drag';
	gesture.element.classList.add('multitrack-clip-dragging');
}
