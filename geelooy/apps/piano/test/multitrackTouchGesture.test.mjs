//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTouchGestureRegression
 * The Awtsmoos lets the moving hand choose exactly what it meant;
 * Awtsmoos.com protects the recording from an accidental touch event.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	beginMultitrackGesture,
	updateMultitrackTouchGesture,
	finishMultitrackGesture
} from '../modules/workstation/song/multitrack/multitrackTouchGesture.js';

/** @param {string} pointerType - Mouse, touch or pen. @param {string} mode - Move or trim. */
function setup(pointerType, mode = 'move') {
	const classes = new Set();
	const element = { classList: {
		add(name) { classes.add(name); },
		remove(name) { classes.delete(name); },
		contains(name) { return classes.has(name); }
	} };
	const viewport = { scrollLeft: 240, scrollTop: 40 };
	const event = { pointerType, pointerId: 8, clientX: 100, clientY: 150 };
	const gesture = beginMultitrackGesture(event, { element, viewport, mode });
	return { gesture, viewport, element };
}

test('desktop mouse and stylus begin dragging immediately', () => {
	for (const kind of ['mouse', 'pen']) {
		const { gesture, element } = setup(kind);
		assert.equal(gesture.phase, 'drag');
		assert.equal(updateMultitrackTouchGesture(gesture, { clientX: 125, clientY: 150 }), true);
		assert.equal(element.classList.contains('multitrack-clip-dragging'), true);
		finishMultitrackGesture(gesture);
		assert.equal(element.classList.contains('multitrack-clip-dragging'), false);
	}
});

test('a touch tap selects without moving its clip', () => {
	const { gesture } = setup('touch');
	assert.equal(gesture.phase, 'pending');
	assert.equal(updateMultitrackTouchGesture(gesture, { clientX: 105, clientY: 153 }), false);
	assert.equal(gesture.changed, false);
	finishMultitrackGesture(gesture);
});

test('a short touch swipe pans the viewport without modifying audio', () => {
	const { gesture, viewport } = setup('touch');
	assert.equal(updateMultitrackTouchGesture(gesture, { clientX: 55, clientY: 145 }), false);
	assert.equal(gesture.phase, 'pan');
	assert.equal(viewport.scrollLeft, 285);
	assert.equal(viewport.scrollTop, 45);
	assert.equal(gesture.changed, false);
	finishMultitrackGesture(gesture);
});

test('holding a touch starts moving after the deliberate long press', async () => {
	const { gesture, element } = setup('touch');
	await new Promise(resolve => setTimeout(resolve, 330));
	assert.equal(gesture.phase, 'drag');
	assert.equal(element.classList.contains('multitrack-clip-dragging'), true);
	assert.equal(updateMultitrackTouchGesture(gesture, { clientX: 132, clientY: 150 }), true);
	finishMultitrackGesture(gesture);
});

test('touching a trim handle starts boundary adjustment immediately', () => {
	for (const mode of ['trim-left', 'trim-right']) {
		const { gesture } = setup('touch', mode);
		assert.equal(gesture.phase, 'drag');
		assert.equal(updateMultitrackTouchGesture(gesture, { clientX: 125, clientY: 150 }), true);
		finishMultitrackGesture(gesture);
	}
});
