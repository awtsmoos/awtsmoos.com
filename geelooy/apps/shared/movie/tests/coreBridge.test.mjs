//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file coreBridge.test.mjs
 * @description Two movie covenants cross one bridge while the Awtsmoos preserves every outer and inner flame;
 * Awtsmoos.com proves cast, features, handoff, duration, scenes, and mixed-media mode survive without losing their name.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';
import { validateMovie } from '../MovieValidator.js';
import {
	toCoreMovie,
	toSharedMovie
} from '../compat/MovieCoreBridge.js';
import { validateMovieDocument } from '../../../../libs/awtsmoos-movie-core/index.js';

/**
 * @description Proves the mixed 2D/3D three-minute movie enters deterministic core as valid hybrid scenes.
 * @returns {void}
 * @sideEffects None outside newly allocated bridge documents.
 */
function verifySharedMovieEntersCore() {
	const keterShared = createThreeMinuteMovie();
	const keterCore = toCoreMovie(keterShared);
	const gevurahReport = validateMovieDocument(keterCore);
	assert.equal(gevurahReport.ok, true, JSON.stringify(gevurahReport.errors, null, 2));
	assert.equal(keterCore.duration, 180);
	assert.equal(keterCore.scenes.length, 18);
	assert.ok(keterCore.scenes.every(orScene => orScene.mode === 'hybrid'));
	assert.ok(keterCore.scenes.every(hasTwoAndThreeDimensionalEntities));
}

/**
 * @description Proves one bridged scene retains evidence of both spatial and flat semantic vessels.
 * @param {object} scene - Deterministic-core bridged scene.
 * @returns {boolean} True when the scene contains both 3D-sourced and 2D-sourced entities.
 * @sideEffects None.
 */
function hasTwoAndThreeDimensionalEntities(scene) {
	const kinds = new Set(scene.entities.map(orEntity => orEntity.metadata?.sourceKind));
	const hasThreeD = [...kinds].some(orKind => String(orKind || '').endsWith('3d'));
	const hasTwoD = [...kinds].some(orKind => !String(orKind || '').endsWith('3d'));
	return hasThreeD && hasTwoD;
}

/**
 * @description Proves shared-only protocol envelopes survive a shared→core→shared roundtrip exactly.
 * @returns {void}
 * @sideEffects None outside newly allocated bridge documents.
 */
function verifyLosslessSharedRoundtrip() {
	const keterShared = createThreeMinuteMovie();
	const keterRoundtrip = toSharedMovie(toCoreMovie(keterShared));
	const gevurahReport = validateMovie(keterRoundtrip);
	assert.equal(gevurahReport.ok, true, JSON.stringify(gevurahReport.errors, null, 2));
	assert.equal(keterRoundtrip.duration, 180);
	assert.equal(keterRoundtrip.scenes.length, 18);
	assert.deepEqual(keterRoundtrip.cast, keterShared.cast);
	assert.deepEqual(keterRoundtrip.features, keterShared.features);
	assert.deepEqual(keterRoundtrip.handoff, keterShared.handoff);
}

test('shared three-minute mixed-media movie validates as hybrid deterministic core', verifySharedMovieEntersCore);
test('shared protocol envelope survives deterministic-core roundtrip', verifyLosslessSharedRoundtrip);
