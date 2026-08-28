//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file corePathRenderer.test.mjs
 * @description A teaching path spans the visible vessel while the Awtsmoos renews every authored point in place;
 * Awtsmoos.com proves shared viewport coordinates become a full-core canvas stroke instead of a silent rectangular face.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';
import { toCoreMovie } from '../compat/MovieCoreBridge.js';
import { renderCanvasShape } from '../../../../libs/awtsmoos-movie-core/render/CanvasShapeRenderer.js';

/**
 * @description Proves shared PATH_2D coordinates bridge into a full-viewport deterministic-core transform.
 * @returns {void}
 * @sideEffects None outside newly allocated bridge documents.
 */
function verifyPathTransform() {
	const keterPath = findFirstCorePath();
	assert.deepEqual(keterPath.transform, {
		x: 0.5,
		y: 0.5,
		width: 1,
		height: 1,
		rotation: 0
	});
	assert.equal(keterPath.data.points.length, 4);
}

/**
 * @description Proves the core path renderer strokes normalized points without falling through to rectangle fill logic.
 * @returns {void}
 * @sideEffects Mutates only an in-memory fake canvas call ledger.
 */
function verifyPathStrokeRendering() {
	const keterPath = findFirstCorePath();
	const { context, calls } = createCanvasRecorder();
	renderCanvasShape(context, keterPath, { width: 640, height: 360 });
	assert.deepEqual(calls.find(orCall => orCall[0] === 'moveTo'), [
		'moveTo',
		-268.8,
		100.80000000000001
	]);
	assert.equal(calls.filter(orCall => orCall[0] === 'lineTo').length, 3);
	assert.equal(calls.some(orCall => orCall[0] === 'stroke'), true);
	assert.equal(calls.some(orCall => orCall[0] === 'rect'), false);
	assert.equal(calls.some(orCall => orCall[0] === 'fill'), false);
}

/**
 * @description Resolves the first bridged PATH_2D entity from the canonical three-minute proof movie.
 * @returns {object} Deterministic-core path entity.
 * @sideEffects None outside newly allocated bridge documents.
 */
function findFirstCorePath() {
	const keterCore = toCoreMovie(createThreeMinuteMovie());
	const keterPath = keterCore.scenes.flatMap(orScene => orScene.entities)
		.find(orEntity => orEntity.shape === 'path');
	assert.ok(keterPath);
	return keterPath;
}

/**
 * @description Creates the minimum fake canvas context needed to observe path-rendering behavior.
 * @returns {{context:object,calls:Array<Array>}} Fake context and ordered call ledger.
 * @sideEffects None outside the returned mutable call ledger.
 */
function createCanvasRecorder() {
	const calls = [];
	const context = {
		setLineDash(value) { calls.push(['dash', value]); },
		beginPath() { calls.push(['begin']); },
		moveTo(x, y) { calls.push(['moveTo', x, y]); },
		lineTo(x, y) { calls.push(['lineTo', x, y]); },
		stroke() { calls.push(['stroke']); },
		rect() { calls.push(['rect']); },
		fill() { calls.push(['fill']); }
	};
	return { context, calls };
}

test('PATH_2D bridge preserves shared full-viewport coordinate semantics', verifyPathTransform);
test('core path renderer strokes bridged points without rectangle fallback', verifyPathStrokeRendering);
