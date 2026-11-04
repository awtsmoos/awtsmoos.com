// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file laneCircuitBreakerScope.test.js
 * @description
 * Iteration 7 pins the circuit breaker's scopes. Production evidence: one
 * lane's text surface fails deterministically (its store refuses writes in
 * read-only service) while its vector surface is healthy — under the old
 * lane-wide circuit, three keyword searches paused the lane for semantic
 * ones too. And after every restart, embedder-warming failures were counted
 * against innocent lanes, so circuits stayed open past the worker's ready
 * moment. Soft failures now count per strategy; hard failures stay global;
 * warmup is never a lane failure.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	clearLaneCircuitBreaker,
	laneBlock,
	recordLaneFailure,
	recordLaneSuccess
} = require('../laneCircuitBreaker.js');

const NOW = 1_000_000;

function fail(lane, code, scope, times = 3) {
	for (let index = 0; index < times; index += 1) {
		recordLaneFailure(lane, Object.assign(new Error(code), { code }), NOW, scope);
	}
}

test('soft failures open only their own strategy scope', () => {
	clearLaneCircuitBreaker();
	fail('mittler-rebbe', 'AWTSMOOS_DB_READONLY_WRITE', 'text');
	assert(laneBlock('mittler-rebbe', 'text', NOW), 'text scope must be open');
	assert.equal(
		laneBlock('mittler-rebbe', 'vector', NOW),
		null,
		'vector scope must stay healthy'
	);
});

test('a success in another scope does not clear this scope', () => {
	clearLaneCircuitBreaker();
	fail('mittler-rebbe', 'AWTSMOOS_DB_READONLY_WRITE', 'text');
	recordLaneSuccess('mittler-rebbe', 'vector');
	assert(laneBlock('mittler-rebbe', 'text', NOW), 'text circuit survives');
	recordLaneSuccess('mittler-rebbe', 'text');
	assert.equal(laneBlock('mittler-rebbe', 'text', NOW), null);
});

test('hard failures still pause the whole lane', () => {
	clearLaneCircuitBreaker();
	recordLaneFailure(
		'sichos-kodesh',
		Object.assign(new Error('worker gone'), { code: 'BGE_WORKER_EXITED' }),
		NOW,
		'text'
	);
	assert(laneBlock('sichos-kodesh', 'text', NOW));
	assert(laneBlock('sichos-kodesh', 'vector', NOW));
});

test('embedder warmup is never counted against a lane', () => {
	clearLaneCircuitBreaker();
	fail('likkutei-sichos', 'MULTILINGUAL_WORKER_WARMING', 'vector', 5);
	assert.equal(laneBlock('likkutei-sichos', 'vector', NOW), null);
});

test('two soft failures stay below the threshold', () => {
	clearLaneCircuitBreaker();
	fail('meluket', 'LIBRARY_LANE_TIMEOUT', 'vector', 2);
	assert.equal(laneBlock('meluket', 'vector', NOW), null);
});
