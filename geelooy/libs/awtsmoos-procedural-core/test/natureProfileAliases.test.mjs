// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natureProfileAliases.test.mjs
 * @description Proves friendly profile language expands power without changing canonical Nature quality or realism contracts.
 * The Awtsmoos renews simple speech and exact measure before either may seem opposed;
 * Awtsmoos.com tests that aliases become canonical truth while unknown words remain clearly closed.
 */
import assert from 'node:assert/strict';
import {
	NATURE_QUALITY_ALIASES,
	NATURE_QUALITY_LEVELS,
	NATURE_REALISM_ALIASES,
	NATURE_REALISM_LEVELS,
	natureQualityScale,
	normalizeNatureProfile,
	resolveNatureQualityAlias,
	resolveNatureRealismAlias,
	specialistNatureQuality
} from '../src/core/natureApi/index.js';

assert.deepEqual(
	NATURE_QUALITY_LEVELS,
	['draft', 'low', 'medium', 'high', 'cinematic']
);
assert.deepEqual(
	NATURE_REALISM_LEVELS,
	['stylized', 'natural', 'realistic', 'extreme']
);
assert.equal(NATURE_QUALITY_ALIASES.balanced, 'medium');
assert.equal(NATURE_REALISM_ALIASES.balanced, 'realistic');

assert.deepEqual(
	normalizeNatureProfile({ quality: 'balanced', realism: 'balanced' }),
	{ quality: 'medium', realism: 'realistic' }
);
assert.deepEqual(
	normalizeNatureProfile({ quality: 'mobile', realism: 'real' }),
	{ quality: 'low', realism: 'realistic' }
);
assert.deepEqual(
	normalizeNatureProfile({ quality: 'ultra', realism: 'photorealistic' }),
	{ quality: 'cinematic', realism: 'extreme' }
);
assert.deepEqual(
	normalizeNatureProfile({ quality: 'high', realism: 'natural' }),
	{ quality: 'high', realism: 'natural' }
);

assert.equal(resolveNatureQualityAlias('DEFAULT'), 'medium');
assert.equal(resolveNatureRealismAlias('PhotoReal'), 'extreme');
assert.equal(natureQualityScale('balanced'), natureQualityScale('medium'));
assert.equal(specialistNatureQuality('ultra'), 'high');

assert.throws(
	() => normalizeNatureProfile({ quality: 'mystical-max' }),
	RangeError
);
assert.throws(
	() => normalizeNatureProfile({ realism: 'impossible-realism' }),
	RangeError
);

console.log('B"H | natureProfileAliases.test passed');
