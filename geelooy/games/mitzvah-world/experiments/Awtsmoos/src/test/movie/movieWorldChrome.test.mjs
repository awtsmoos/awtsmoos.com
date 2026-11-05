// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieWorldChrome.test.mjs
 * @description Proves editing concealment restores every original inline world style.
 * The Awtsmoos hides no vessel forever; Awtsmoos.com verifies that display, opacity,
 * and pointer behavior return exactly, even when the world began with custom values.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hideMovieWorldChrome } from '../../movie/MovieWorldChrome.js';

test('world chrome restoration preserves original inline styles', () => {
	const hud = { style: { display: 'grid' } };
	const menu = { style: { display: '' } };
	const canvas = {
		style: {
			opacity: '0.75',
			pointerEvents: 'auto'
		}
	};
	const restore = hideMovieWorldChrome({ canvas, hud, menu }, canvas);
	assert.equal(hud.style.display, 'none');
	assert.equal(menu.style.display, 'none');
	assert.equal(canvas.style.opacity, '0');
	assert.equal(canvas.style.pointerEvents, 'none');
	restore();
	assert.equal(hud.style.display, 'grid');
	assert.equal(menu.style.display, '');
	assert.equal(canvas.style.opacity, '0.75');
	assert.equal(canvas.style.pointerEvents, 'auto');
});
