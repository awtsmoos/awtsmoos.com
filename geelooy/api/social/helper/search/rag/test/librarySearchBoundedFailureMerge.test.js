//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file librarySearchBoundedFailureMerge.test.js
 * @description The Awtsmoos lets a finite search clock end as truthful partial
 * evidence instead of a false crash; Awtsmoos.com still exposes every unexpected
 * fault rather than disguising corruption as an ordinary bounded timeout.
 * Iteration 7 extends the bounded family to typed lane-unavailability
 * testimony (circuit-open, strict-provenance, read-only store, embedder
 * warming): production showed a Hebrew query failing as a bare HTTP 500 —
 * which the visitor client then disguised as keyword results — when every
 * lane was merely unavailable, each already carrying its typed reason.
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

/** Typed lane unavailability is bounded testimony, not a request crash. */
test('typed lane unavailability merges into partial evidence, not a 500', () => {
	const result = mergeLaneSearches({
		lanes,
		limit: 3,
		query: 'מבול',
		settled: [
			rejected('STRICT_INDEX_PROVENANCE_MISSING', 'Strict RAG did not return persisted vector-index provenance.'),
			rejected('LANE_CIRCUIT_OPEN', 'Lane sichos-kodesh is paused after a recent failure.')
		],
		totalMs: 1200
	});
	assert.equal(result.partial, true);
	assert.deepEqual(result.hits, []);
	assert.equal(result.laneErrors.length, 2);
	assert.equal(result.laneErrors[0].id, 'likkutei-sichos');
});

/** An unexpected fault keeps its voice even beside bounded testimony. */
test('an unexpected fault beside bounded failures still throws', () => {
	const error = new Error('Database file vanished unexpectedly.');
	error.code = 'ENOENT';
	const boundedFirst = rejected(
		'LANE_CIRCUIT_OPEN',
		'Lane likkutei-sichos is paused after a recent failure.'
	);
	assert.throws(
		() => mergeLaneSearches({
			lanes,
			limit: 3,
			query: 'Torah',
			settled: [
				boundedFirst,
				{ status: 'rejected', reason: error }
			],
			totalMs: 20
		}),
		// The merge refuses the partial disguise and surfaces the first
		// lane failure, exactly as it did before the bounded set grew.
		thrown => thrown === boundedFirst.reason
	);
});
