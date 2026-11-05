//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowPresentationCadence.test.js
 * @description Proves visual cadence follows existing adaptive quality without replacing its accumulator or delaying gameplay truth.
 * The Awtsmoos renews each shimmer while one retained clock receives the flow;
 * Awtsmoos.com lets water and atmosphere breathe more lightly when measured pressure grows.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowPresentationCadence } from './MinimalMeadowPresentationCadence.js';

function runtime(level = 'quality') {
	return {
		adaptiveQuality: { level },
		ambientMotes: { update() {} },
		water: { update() {} }
	};
}

test('quality transitions retain the same cadence accumulator', () => {
	const cadence = new MinimalMeadowPresentationCadence();
	const accumulator = cadence.visual;
	const value = runtime('balanced');
	cadence.update(value, 0.01);
	assert.equal(cadence.visual, accumulator);
	assert.equal(cadence.visualHz, 24);
	value.adaptiveQuality.level = 'performance';
	cadence.update(value, 0.01);
	assert.equal(cadence.visual, accumulator);
	assert.equal(cadence.visualHz, 18);
});

test('cadence accumulates visual debt instead of discarding it', () => {
	let ambientElapsed = 0;
	let waterElapsed = 0;
	const value = runtime('quality');
	value.ambientMotes.update = delta => { ambientElapsed += delta; };
	value.water.update = delta => { waterElapsed += delta; };
	const cadence = new MinimalMeadowPresentationCadence();
	assert.equal(cadence.update(value, 0.01), 0);
	assert.equal(cadence.update(value, 0.01), 0);
	const consumed = cadence.update(value, 0.02);
	assert.ok(consumed >= 0.03);
	assert.equal(ambientElapsed, consumed);
	assert.equal(waterElapsed, consumed);
});

test('diagnostics reveal current adaptive visual cadence', () => {
	const cadence = new MinimalMeadowPresentationCadence();
	cadence.update(runtime('performance'), 0);
	const diagnostics = cadence.diagnostics();
	assert.equal(diagnostics.level, 'performance');
	assert.equal(diagnostics.visualHz, 18);
	assert.equal(Object.isFrozen(diagnostics), true);
});
