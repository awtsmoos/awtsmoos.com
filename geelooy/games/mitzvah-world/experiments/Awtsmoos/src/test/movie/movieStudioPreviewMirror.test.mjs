// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioPreviewMirror.test.mjs
 * @description Proves the Program monitor receives a stable copied frame while the source renderer keeps ownership of its canvas.
 * The Awtsmoos renews source and visible reflection without confusing their vessels; Awtsmoos.com
 * verifies size, pixels, scheduling, refresh, and destruction through one focused mirror contract.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioPreviewMirror } from '../../movie/MovieStudioPreviewMirror.js';

function createHarness() {
	const calls = {
		cancelled: [],
		clear: [],
		draw: []
	};
	const context = {
		clearRect: (...values) => calls.clear.push(values),
		drawImage: (...values) => calls.draw.push(values)
	};
	const canvas = {
		className: '',
		height: 0,
		removed: false,
		width: 0,
		getContext: () => context,
		remove() {
			this.removed = true;
		},
		setAttribute() {}
	};
	const preview = {
		children: [],
		append(element) {
			this.children.push(element);
		},
		querySelectorAll: () => []
	};
	const environment = {
		cancelAnimationFrame: id => calls.cancelled.push(id),
		document: { createElement: () => canvas },
		requestAnimationFrame: () => 17
	};
	return { calls, canvas, environment, preview };
}

test('mirror copies composite pixels into a stable visible canvas', () => {
	const harness = createHarness();
	const source = { height: 360, width: 640 };
	const session = {
		overlay: { canvas: source },
		view: { preview: harness.preview }
	};
	const mirror = new MovieStudioPreviewMirror(session, harness.environment);
	assert.equal(harness.preview.children[0], harness.canvas);
	assert.equal(harness.canvas.width, 640);
	assert.equal(harness.canvas.height, 360);
	assert.equal(harness.calls.draw.length, 1);
	assert.equal(harness.calls.draw[0][0], source);
	assert.equal(mirror.refresh(), true);
	assert.equal(harness.calls.draw.length, 2);
	mirror.destroy();
	assert.deepEqual(harness.calls.cancelled, [17]);
	assert.equal(harness.canvas.removed, true);
});

test('mirror falls back to the runtime renderer and tolerates no source', () => {
	const harness = createHarness();
	const runtimeSource = { height: 720, width: 1280 };
	const session = {
		runtime: { renderer: { canvas: runtimeSource } },
		view: { preview: harness.preview }
	};
	const mirror = new MovieStudioPreviewMirror(session, harness.environment);
	assert.equal(harness.calls.draw[0][0], runtimeSource);
	session.runtime.renderer.canvas = null;
	assert.equal(mirror.refresh(), false);
	mirror.destroy();
});
