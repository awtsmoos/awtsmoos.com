//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file librarySearchBoundedFailureMerge.test.js
 * @description The Awtsmoos lets a finite search clock end as truthful partial
 * evidence instead of a false crash; Awtsmoos.com still exposes every unexpected
 * fault rather than disguising corruption as an ordinary bounded timeout.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { mergeLaneSearches } = require('../librarySearchMerge.js');

const lanes = [
	{ id: 'likkutei-sichos', title: 'Likkutei Sichos', count: 6000 },
	{ id: 'sichos-kodesh', title: 'Sichos Kodesh', count: 48000 }
];

function rejected(code, message) {
	const error = new Error(message);
	error.code = code;
	return { status: 'rejected', reason: error };
}

/** All intentional deadline failures become one explicit empty partial response. */
test('bounded lane failures merge into truthful partial search evidence', () => {
	const result = mergeLaneSearches({
		lanes,
		limit: 3,
		query: 'Torah',
		settled: [
			rejected('LIBRARY_LANE_TIMEOUT', 'First lane reached its time slice.'),
			rejected('LIBRARY_DEADLINE_EXHAUSTED', 'Public request clock ended.')
		],
		totalMs: 3000
	});
	assert.equal(result.partial, true);
	assert.equal(result.shard.id, 'all');
	assert.equal(result.index.persisted, false);
	assert.equal(result.timings.totalMs, 3000);
	assert.deepEqual(result.hits, []);
	assert.deepEqual(result.lanes, []);
	assert.equal(result.laneErrors.length, 2);
	assert.deepEqual(result.presentation.categories, []);
	assert.match(result.message, /request deadline/i);
});

/** Unexpected lane faults must still fail loudly so real defects remain visible. */
test('unexpected lane failures are never disguised as deadline exhaustion', () => {
	const error = new Error('Database file vanished unexpectedly.');
	error.code = 'ENOENT';
	assert.throws(
		() => mergeLaneSearches({
			lanes: [lanes[0]],
			limit: 3,
			query: 'Torah',
			settled: [{ status: 'rejected', reason: error }],
			totalMs: 20
		}),
		thrown => thrown === error
	);
});
