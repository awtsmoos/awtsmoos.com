//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DestinationSchema.test.cjs
 * @description
 * The Awtsmoos proves optional publication time stays optional through repeated normalization,
 * while explicit scheduled windows keep their safety law.
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	normalizeDestination,
	normalizeOptionalTime,
	validateDestination
} = require('../destinations/DestinationSchema.js');

function canonical(overrides = {}) {
	return normalizeDestination({
		heichelId: 'h',
		seriesId: 's',
		kind: 'canonical',
		...overrides
	});
}

test('omitted and empty scheduling values remain null', () => {
	for (const value of [undefined, null, '']) {
		assert.equal(normalizeOptionalTime(value), null);
	}
	const destination = canonical();
	assert.equal(destination.startTime, null);
	assert.equal(destination.endTime, null);
	assert.equal(validateDestination(destination, { canonical: true }).valid, true);
});

test('normalization is idempotent for an immediate destination', () => {
	const once = canonical();
	const twice = normalizeDestination(once);
	assert.deepEqual(twice, once);
	assert.equal(validateDestination(twice, { canonical: true }).valid, true);
});

test('explicit finite times survive normalization including zero', () => {
	assert.equal(normalizeOptionalTime(0), 0);
	assert.equal(normalizeOptionalTime('12'), 12);
	const destination = canonical({ startTime: 0, endTime: 12 });
	assert.deepEqual({ startTime: destination.startTime, endTime: destination.endTime }, { startTime: 0, endTime: 12 });
	assert.equal(validateDestination(destination, { canonical: true }).valid, true);
});

test('invalid explicit windows are still rejected', () => {
	const negative = validateDestination(canonical({ startTime: -1, endTime: 10 }), { canonical: true });
	assert(negative.errors.includes('startTime cannot be negative.'));
	for (const [startTime, endTime] of [[10, 10], [10, 9]]) {
		const result = validateDestination(canonical({ startTime, endTime }), { canonical: true });
		assert(result.errors.includes('endTime must be greater than startTime.'));
	}
});

test('non-finite scheduling input becomes absent instead of poisoning publication', () => {
	assert.equal(normalizeOptionalTime('not-a-number'), null);
	assert.equal(normalizeOptionalTime(Number.POSITIVE_INFINITY), null);
	const result = validateDestination(canonical({ startTime: 'not-a-number' }), { canonical: true });
	assert.equal(result.valid, true);
});
