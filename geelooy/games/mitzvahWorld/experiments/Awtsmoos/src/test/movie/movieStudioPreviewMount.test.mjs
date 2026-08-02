// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioPreviewMount.test.mjs
 * @description Proves the current composite canvas replaces stale preview canvases and enters the visible Program monitor.
 * The Awtsmoos renews every frame beyond an orphaned hidden canvas; Awtsmoos.com verifies
 * the exact graded 3D image belongs to the preview vessel the artist actually watches.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mountMovieStudioPreviewCanvas } from '../../movie/MovieStudioPreviewMount.js';

function createCanvas(name) {
	return {
		attributes: new Map(),
		name,
		parentElement: null,
		removed: false,
		remove() {
			this.removed = true;
			this.parentElement = null;
		},
		setAttribute(key, value) {
			this.attributes.set(key, String(value));
		}
	};
}

function createPreview(existing = []) {
	return {
		children: [...existing],
		append(canvas) {
			canvas.parentElement = this;
			this.children.push(canvas);
		},
		querySelectorAll() {
			return this.children.filter(child => !child.removed);
		}
	};
}

test('mount replaces stale output and exposes the current composite canvas', () => {
	const stale = createCanvas('stale');
	const current = createCanvas('current');
	const preview = createPreview([stale]);
	const session = {
		overlay: { canvas: current },
		view: { preview }
	};
	assert.equal(mountMovieStudioPreviewCanvas(session), current);
	assert.equal(stale.removed, true);
	assert.equal(current.parentElement, preview);
	assert.equal(current.attributes.get('role'), 'img');
	assert.equal(
		current.attributes.get('aria-label'),
		'Live 3D composite movie preview'
	);
});

test('mount is idempotent and tolerates incomplete sessions', () => {
	const current = createCanvas('current');
	const preview = createPreview();
	current.parentElement = preview;
	preview.children.push(current);
	const session = {
		overlay: { canvas: current },
		view: { preview }
	};
	assert.equal(mountMovieStudioPreviewCanvas(session), current);
	assert.equal(preview.children.length, 1);
	assert.equal(mountMovieStudioPreviewCanvas({}), null);
});
