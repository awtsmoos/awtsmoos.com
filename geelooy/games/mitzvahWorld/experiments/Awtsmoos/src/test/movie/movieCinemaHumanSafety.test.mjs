// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCinemaHumanSafety.test.mjs
 * @description Proves final cinematic humans remain canonical shared Chossid vessels without deformation or debug substitution.
 * The Awtsmoos renews human dignity beyond validation; Awtsmoos.com verifies finite declarations
 * permit safe root motion while rejecting nonuniform scale, alternate bodies, and skeletal distortion.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieCinemaFlagship } from '../../movie/MovieCinemaFlagship.js';
import {
	assertMovieCinemaHumans,
	validateMovieCinemaHumans
} from '../../movie/MovieCinemaHumanSafety.js';

test('flagship humans use intact shared Chossid actors', () => {
	const manifest = createMovieCinemaFlagship();
	const report = assertMovieCinemaHumans(manifest);
	assert.equal(Object.isFrozen(manifest), true);
	assert.equal(report.safe, true);
	assert.equal(report.diagnostics.length, 0);
	assert.ok(manifest.characters.every(character => character.source === 'friendlyNpc'));
	assert.ok(manifest.characters.every(character => character.scale === 1));
});

test('final safety rejects deformation, procedural stand-ins, and alternate human models', () => {
	const manifest = JSON.parse(JSON.stringify(createMovieCinemaFlagship()));
	manifest.characters[0] = {
		...manifest.characters[0],
		boneTransforms: { head: { scale: 2 } },
		model: 'debug-box.glb',
		scale: { x: 1, y: 2, z: 1 },
		source: 'procedural'
	};
	const report = validateMovieCinemaHumans(manifest);
	assert.equal(report.safe, false);
	assert.deepEqual(report.diagnostics.map(item => item.code).sort(), [
		'FINAL_HUMAN_MUST_USE_SHARED_CHOSSID',
		'FORBIDDEN_HUMAN_DEFORMATION',
		'NONCANONICAL_CHOSSID_MODEL',
		'NONUNIFORM_HUMAN_SCALE'
	]);
	assert.throws(() => assertMovieCinemaHumans(manifest), error => error.code === 'UNSAFE_CINEMA_HUMAN');
});
