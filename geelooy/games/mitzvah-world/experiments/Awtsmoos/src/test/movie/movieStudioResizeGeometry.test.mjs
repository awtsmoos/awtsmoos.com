// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioResizeGeometry.test.mjs
 * @description Proves pointer, keyboard, bounds, direction, accelerated steps, and reset geometry.
 * The Awtsmoos renews every finite separator beyond measure; Awtsmoos.com verifies
 * pointer and keyboard produce the same bounded serializable pane preferences.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movieStudioKeyboardResize,
	movieStudioPointerResize,
	movieStudioResetResize
} from '../../movie/MovieStudioResizeGeometry.js';

const bounds = { bottom: 900, left: 100, right: 1200, top: 50 };

test('pointer resize computes inspector, timeline, and track header values', () => {
	assert.deepEqual(
		movieStudioPointerResize('inspector', { x: 800, y: 0 }, bounds),
		{ inspectorWidth: 400 }
	);
	assert.deepEqual(
		movieStudioPointerResize('timeline', { x: 0, y: 500 }, bounds),
		{ timelineHeight: 400 }
	);
	assert.deepEqual(
		movieStudioPointerResize('trackHeader', { x: 280, y: 0 }, bounds),
		{ trackHeaderWidth: 180 }
	);
});

test('pointer resize clamps every pane to safe limits', () => {
	assert.equal(
		movieStudioPointerResize('inspector', { x: 0, y: 0 }, bounds).inspectorWidth,
		620
	);
	assert.equal(
		movieStudioPointerResize('timeline', { x: 0, y: 890 }, bounds).timelineHeight,
		180
	);
	assert.equal(
		movieStudioPointerResize('trackHeader', { x: 900, y: 0 }, bounds).trackHeaderWidth,
		280
	);
});

test('keyboard resize uses orientation-aware directions and step', () => {
	const current = {
		inspectorWidth: 340,
		timelineHeight: 340,
		trackHeaderWidth: 148
	};
	assert.deepEqual(
		movieStudioKeyboardResize('inspector', 'ArrowLeft', current),
		{ inspectorWidth: 352 }
	);
	assert.deepEqual(
		movieStudioKeyboardResize('timeline', 'ArrowUp', current, 32),
		{ timelineHeight: 372 }
	);
	assert.deepEqual(
		movieStudioKeyboardResize('trackHeader', 'ArrowRight', current),
		{ trackHeaderWidth: 160 }
	);
	assert.equal(
		movieStudioKeyboardResize('timeline', 'ArrowRight', current),
		null
	);
});

test('double-click reset values are canonical defaults', () => {
	assert.deepEqual(movieStudioResetResize('inspector'), { inspectorWidth: 340 });
	assert.deepEqual(movieStudioResetResize('timeline'), { timelineHeight: 340 });
	assert.deepEqual(movieStudioResetResize('trackHeader'), { trackHeaderWidth: 148 });
});
