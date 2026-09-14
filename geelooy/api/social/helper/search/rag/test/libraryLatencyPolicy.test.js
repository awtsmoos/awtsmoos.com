// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file libraryLatencyPolicy.test.js
 * @description
 * Exact Torah navigation never waits for enrichment, and broad discovery keeps
 * one cheaper lexical baseline beside finite semantic lanes. These contracts
 * protect useful results and request capacity under cold or overloaded systems.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { canonicalNavigationResult } = require('../canonicalNavigationResult.js');
const {
	laneSearchOptions,
	librarySearch
} = require('../librarySearch.js');
const { lexicalLaneOrder } = require('../librarySearchPlanner.js');
const {
	BASELINE_SCAN_MS,
	BASELINE_TEXT_ROWS,
	CANONICAL_CATALOG_WAIT_MS,
	DEFAULT_LIBRARY_DEADLINE_MS,
	libraryDeadlineAt,
	libraryDeadlineMs,
	remainingLibraryMs,
	withLaneDeadline
} = require('../librarySearchDeadline.js');

test('registered Torah Ohr library navigation never opens the corpus', async () => {
	const startedAt = Date.now();
	const result = await librarySearch({
		$i: { db: { directory: '/definitely/missing/awtsmoos-db' } },
		query: 'תורה אור',
		limit: 5
	});
	assert(Date.now() - startedAt < 500, 'registered work must remain a tiny registry lookup');
	assert.equal(result.mode, 'navigation');
	assert.equal(result.hits[0].row.pageId, 346791);
});

test('text-only baseline uses a smaller shared scan without overriding explicit callers', () => {
	const lane = { id: 'torah-source-corpus', textOnly: true };
	const defaults = laneSearchOptions(lane, { query: 'שלום' }, 8000);
	const explicit = laneSearchOptions(lane, { query: 'שלום', textMaxRows: 6500 }, 8000);
	assert.equal(BASELINE_TEXT_ROWS, 4000);
	assert.equal(BASELINE_SCAN_MS, 3500);
	assert.equal(defaults.strategy, 'text');
	assert.equal(defaults.textMaxMs, 3500);
	assert.equal(defaults.textMaxRows, 4000);
	assert.equal(explicit.textMaxRows, 6500);
});

test('vector lanes retain their requested strategy and row policy', () => {
	const options = laneSearchOptions(
		{ id: 'meluket', textOnly: false },
		{ strategy: 'vector', textMaxRows: 7000 },
		8000
	);
	assert.equal(options.strategy, 'vector');
	assert.equal(options.textMaxRows, 7000);
});

test('Hebrew lexical enrichment prefers small physical publications first', () => {
	const ordered = lexicalLaneOrder([
		{ id: 'large', count: 100, parts: Array.from({ length: 12 }, () => ({})) },
		{ id: 'small-b', count: 50 },
		{ id: 'small-a', count: 10 }
	]);
	assert.deepEqual(ordered.map(lane => lane.id), ['small-a', 'small-b', 'large']);
});

test('canonical-only response never pretends semantic vectors were consulted', () => {
	const result = canonicalNavigationResult('תורה אור', [
		{ source: 'canonical-work-title', score: 100, row: { title: 'תורה אור' } }
	], Date.now(), 5);
	assert.equal(result.mode, 'navigation');
	assert.equal(result.indexed, false);
	assert.equal(result.vectorSource, null);
	assert.equal(result.hits[0].rank, 1);
});

test('multi-lane and cold-catalog waits are finite policy constants', () => {
	assert.equal(CANONICAL_CATALOG_WAIT_MS, 350);
	assert.equal(DEFAULT_LIBRARY_DEADLINE_MS, 8000);
	assert.equal(libraryDeadlineMs(), 8000);
	assert.equal(libraryDeadlineMs(10), 500);
	assert.equal(libraryDeadlineMs(999999), 15000);
	const startedAt = 1000;
	const deadlineAt = libraryDeadlineAt({ libraryMaxMs: 8000 }, startedAt);
	assert.equal(deadlineAt, 9000);
	assert.equal(remainingLibraryMs(deadlineAt, 8500), 500);
	assert.equal(remainingLibraryMs(deadlineAt, 9100), 0);
});

test('one slow enrichment rejects with a stable coded timeout', async () => {
	await assert.rejects(
		withLaneDeadline(() => new Promise(() => {}), 'slow-lane', 15),
		error => error.code === 'LIBRARY_LANE_TIMEOUT' && error.laneId === 'slow-lane'
	);
});
