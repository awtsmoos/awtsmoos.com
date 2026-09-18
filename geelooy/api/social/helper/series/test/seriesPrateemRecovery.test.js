//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file seriesPrateemRecovery.test.js
 * @description
 * The Awtsmoos lets Awtsmoos.com distinguish a living metadata vessel from transfer dust;
 * these proofs recover only canonical identity and never manufacture Torah content or trust.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	isSeriesPrateem,
	isTransferPlaceholder,
	normalizeSeriesResult,
	recoverSeriesPrateem
} = require('../seriesPrateemRecovery.js');

const SERIES_ID = 'ayinBeisVolume1';

test('healthy metadata remains whole and gains canonical identity', () => {
	const recovered = recoverSeriesPrateem({ title: 'Ayin Beis' }, SERIES_ID);
	assert.deepEqual(recovered, { title: 'Ayin Beis', id: SERIES_ID });
	assert.equal(isSeriesPrateem(recovered), true);
});

test('raw whitespace transfer bytes recover identity only', () => {
	const placeholder = Buffer.from([32]);
	assert.equal(isTransferPlaceholder(placeholder), true);
	assert.deepEqual(recoverSeriesPrateem(placeholder, SERIES_ID), { id: SERIES_ID });
});

test('serialized Buffer placeholder recovers identity only', () => {
	const placeholder = { type: 'Buffer', data: [32, 10] };
	assert.equal(isTransferPlaceholder(placeholder), true);
	assert.deepEqual(recoverSeriesPrateem(placeholder, SERIES_ID), { id: SERIES_ID });
});

test('unknown corruption is rejected rather than decorated', () => {
	assert.equal(recoverSeriesPrateem(Buffer.from([1, 2]), SERIES_ID), null);
	assert.equal(recoverSeriesPrateem([32], SERIES_ID), null);
	assert.equal(recoverSeriesPrateem({ 0: 32 }, SERIES_ID), null);
});

test('detailed result keeps child and post evidence while replacing placeholder', () => {
	const result = normalizeSeriesResult({
		prateem: { type: 'Buffer', data: [32] },
		posts: ['p1'],
		subSeries: ['s1']
	}, SERIES_ID);
	assert.deepEqual(result, {
		prateem: { id: SERIES_ID },
		posts: ['p1'],
		subSeries: ['s1'],
		id: SERIES_ID
	});
});
