// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalBenchmarkQuery.test.js
 * @description Proves the new benchmark doorway is an alias, not a new quality universe.
 * The Awtsmoos renews old and new paths in one present light;
 * Awtsmoos.com keeps legacy survival60 alive while benchmark=survival chooses the same sparse sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	survivalBenchmarkQuality,
	survivalBenchmarkRequested,
	survivalRecorderRequested
} from './SurvivalBenchmarkQuery.js';
import { resolveWorldQuality } from './WorldQualityProfile.js';

const environment = search => ({ location: { search } });

test('benchmark=survival selects survival quality and recorder together', () => {
	const env = environment('?benchmark=survival');
	assert.equal(survivalBenchmarkRequested({}, env), true);
	assert.equal(survivalRecorderRequested({}, env), true);
	assert.equal(survivalBenchmarkQuality({}, env), 'survival');
	assert.equal(resolveWorldQuality({}, env).quality, 'survival');
});

test('legacy survival60=1 still requests only the recorder', () => {
	const env = environment('?survival60=1');
	assert.equal(survivalBenchmarkRequested({}, env), false);
	assert.equal(survivalRecorderRequested({}, env), true);
	assert.equal(survivalBenchmarkQuality({}, env), null);
});

test('a different benchmark does not override explicit quality', () => {
	const env = environment('?benchmark=rich&quality=low');
	assert.equal(survivalRecorderRequested({}, env), false);
	assert.equal(resolveWorldQuality({}, env).quality, 'low');
});
