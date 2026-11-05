// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceOverlayInteraction.test.mjs
 * @description Proves canonical path commit, cancellation, recording guards, keyboard deletion, and cleanup.
 * The Awtsmoos renews each touch yet leaves no captured pointer behind; Awtsmoos.com keeps
 * preview, commit, accessibility, and destruction in one verified and reversible rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioPerformanceOverlayDrag } from '../../movie/MovieStudioPerformanceOverlayDrag.js';
import { MovieStudioPerformanceOverlayInteraction } from '../../movie/MovieStudioPerformanceOverlayInteraction.js';

function createOverlay(phase = 'idle') {
	const calls = [];
	const listeners = new Map();
	const captures = new Set();
	const root = {
		addEventListener(type, handler) { listeners.set(type, handler); },
		focus() {},
		hasPointerCapture: pointerId => captures.has(pointerId),
		releasePointerCapture(pointerId) { captures.delete(pointerId); calls.push(['release', pointerId]); },
		removeEventListener(type) { listeners.delete(type); },
		setPointerCapture(pointerId) { captures.add(pointerId); calls.push(['capture', pointerId]); }
	};
	const controller = {
		recorder: { status: () => ({ phase }) },
		renderStatus() { calls.push(['render-status']); },
		session: {
			project: {
				performance: {
					takes: [{
						id: 'take-1',
						transformSamples: [{ position: [1, 2, 3] }]
					}]
				}
			},
			publicApi: {
				performance: {
					path: {
						deletePoint: (...args) => calls.push(['delete', ...args]),
						movePoint: (...args) => calls.push(['move', ...args])
					}
				}
			},
			runtime: { camera: {} }
		}
	};
	return { calls, controller, drag: null, listeners, preview: {}, root, selected: null };
}

function pointerEvent(pointerId = 7) {
	return {
		pointerId,
		preventDefault() {},
		target: {
			closest: () => ({
				dataset: {
					performancePathIndex: '0',
					performanceTakeId: 'take-1'
				}
			})
		}
	};
}

test('drag cancellation and destruction release capture without authoring residue', () => {
	const overlay = createOverlay();
	const drag = new MovieStudioPerformanceOverlayDrag(overlay);
	drag.begin(pointerEvent(7));
	drag.cancel(pointerEvent(7));
	assert.equal(overlay.drag, null);
	assert.deepEqual(overlay.calls, [['capture', 7], ['release', 7]]);
	drag.begin(pointerEvent(8));
	drag.complete(pointerEvent(8));
	assert.deepEqual(overlay.calls.at(-2), [
		'move',
		'take-1',
		{ index: 0, position: [1, 2, 3] }
	]);
	drag.begin(pointerEvent(9));
	drag.destroy();
	assert.deepEqual(overlay.calls.at(-1), ['release', 9]);
});

test('recording blocks drag while keyboard deletion and listener cleanup remain canonical', () => {
	const recordingOverlay = createOverlay('recording');
	new MovieStudioPerformanceOverlayDrag(recordingOverlay).begin(pointerEvent());
	assert.equal(recordingOverlay.drag, null);
	const overlay = createOverlay();
	const interaction = new MovieStudioPerformanceOverlayInteraction(overlay);
	overlay.selected = { index: 0, takeId: 'take-1' };
	overlay.listeners.get('keydown')({ key: 'Delete', preventDefault() {} });
	assert.deepEqual(overlay.calls.at(-1), [
		'delete',
		'take-1',
		{ index: 0 }
	]);
	interaction.destroy();
	assert.equal(overlay.listeners.size, 0);
});
