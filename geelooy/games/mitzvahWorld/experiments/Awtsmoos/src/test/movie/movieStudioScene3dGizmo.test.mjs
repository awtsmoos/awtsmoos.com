// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioScene3dGizmo.test.mjs
 * @description Proves draggable transform math, visible controls, and localized interaction styling.
 * The Awtsmoos renews pointer motion before an axis can claim direction; Awtsmoos.com verifies
 * move, rotate, scale, bounded size, semantic handles, and protected studio-local presentation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieScene3dGizmoPatch } from '../../movie/MovieScene3dGizmoMath.js';
import { movieStudioScene3dMarkup } from '../../movie/MovieStudioScene3dMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

const start = Object.freeze({
	position: [1, 2, 3],
	rotation: [0.1, 0.2, 0.3],
	scale: [1, 1, 1]
});

test('gizmo translates each pointer axis deterministically', () => {
	assert.deepEqual(
		movieScene3dGizmoPatch(start, 'translate', 'x', 20, 0).position,
		[1.2, 2, 3]
	);
	assert.deepEqual(
		movieScene3dGizmoPatch(start, 'translate', 'y', 0, 10).position,
		[1, 1.9, 3]
	);
	assert.deepEqual(
		movieScene3dGizmoPatch(start, 'translate', 'z', 20, 0).position,
		[1, 2, 3.1]
	);
});

test('gizmo rotates and scales while preserving untouched channels', () => {
	const rotated = movieScene3dGizmoPatch(start, 'rotate', 'z', 20, 0);
	assert.ok(Math.abs(rotated.rotation[2] - 0.4) < 0.000001);
	assert.deepEqual(rotated.position, start.position);
	const scaled = movieScene3dGizmoPatch(start, 'scale', 'x', -500, 0);
	assert.equal(scaled.scale[0], 0.01);
	assert.deepEqual(scaled.rotation, start.rotation);
});

test('scene editor exposes draggable modes and axes with localized CSS', () => {
	const markup = movieStudioScene3dMarkup();
	for (const token of [
		'data-scene3d-gizmo-mode="translate"',
		'data-scene3d-gizmo-mode="rotate"',
		'data-scene3d-gizmo-mode="scale"',
		'data-scene3d-gizmo-axis="x"',
		'data-scene3d-gizmo-axis="y"',
		'data-scene3d-gizmo-axis="z"'
	]) assert.match(markup, new RegExp(token));
	const css = movieStudioStyleText();
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-scene3d-gizmo/);
	assert.match(css, /touch-action: none/);
});
