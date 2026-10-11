// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorSkyDirector.test.js
 * @description Proves the sky director sets known skies, records the choice,
 * and refuses unknown skies.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSkyDirector } from './MitzvahWorldCreatorSkyDirector.js';

test('setSky applies the preset and reports the current sky', () => {
	const applied = [];
	const recorded = [];
	const director = createSkyDirector({
		environmentTarget: { setEnvironment: values => applied.push(values) },
		record: entry => recorded.push(entry)
	});
	director.setSky('golden');
	assert.equal(director.skyId(), 'golden');
	assert.equal(applied.length, 1);
	assert.equal(recorded.length, 1);
	assert.equal(recorded[0].kind, 'sky');
	assert.equal(recorded[0].skyId, 'golden');
	const description = director.describe();
	assert.equal(description.id, 'golden');
	assert.equal(description.label, 'Golden hour');
});

test('setSky throws a deterministic error for unknown skies', () => {
	const director = createSkyDirector();
	assert.throws(() => director.setSky('eclipse'), /SKY_UNKNOWN:eclipse/);
});

test('director works without renderer or record hooks', () => {
	const director = createSkyDirector({ skyId: 'night' });
	assert.equal(director.skyId(), 'night');
	director.setSky('dawn');
	assert.equal(director.skyId(), 'dawn');
});
