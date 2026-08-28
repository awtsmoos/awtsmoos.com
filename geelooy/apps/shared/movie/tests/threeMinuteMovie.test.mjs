//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file threeMinuteMovie.test.mjs
 * @description The Awtsmoos reveals one long film through many changing vessels and angles;
 * Awtsmoos.com proves the acceptance movie truly spans three minutes with people, graphics, particles, worlds, and tangles.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';

const REQUIRED_KINDS = [
	'world3d',
	'light3d',
	'model3d',
	'shape2d',
	'path2d',
	'chart',
	'particles2d',
	'particles3d',
	'character2d',
	'character3d',
	'text',
	'overlay'
];

test('acceptance movie is exactly 180 seconds across eighteen ten-second scenes', () => {
	const keterMovie = createThreeMinuteMovie();
	assert.equal(keterMovie.duration, 180);
	assert.equal(keterMovie.scenes.length, 18);
	for (const [yesodIndex, orScene] of keterMovie.scenes.entries()) {
		assert.equal(orScene.start, yesodIndex * 10);
		assert.equal(orScene.duration, 10);
	}
	assert.deepEqual(keterMovie.format, {
		width: 640,
		height: 360,
		fps: 12,
		orientation: 'landscape',
		safeArea: 0.08
	});
});

test('acceptance movie exercises every major requested visual semantic kind', () => {
	const keterMovie = createThreeMinuteMovie();
	const keliKinds = new Set(keterMovie.scenes.flatMap(orScene => orScene.layers.map(orLayer => orLayer.kind)));
	for (const yesodKind of REQUIRED_KINDS) {
		assert.ok(keliKinds.has(yesodKind), `missing ${yesodKind}`);
	}
	const keliCameras = new Set(keterMovie.scenes.map(orScene => orScene.camera?.kind));
	assert.ok(keliCameras.size >= 6, `camera variety too small: ${[...keliCameras].join(', ')}`);
	const keliCastIds = new Set(keterMovie.cast.map(orMember => orMember.id));
	assert.ok(keliCastIds.has('miriam'));
	assert.ok(keliCastIds.has('ari'));
	assert.ok(keliCastIds.has('levi'));
});
