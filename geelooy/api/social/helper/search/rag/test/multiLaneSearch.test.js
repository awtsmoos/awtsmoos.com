// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multiLaneSearch.test.js
 * @description
 * An unscoped library answer must reveal every completed lane fairly, preserve
 * corpus provenance, and report a failed lane without erasing successful voices.
 */

const assert = require('node:assert/strict');
const {
	mergeLaneSearches,
	roundRobinHits
} = require('../librarySearchMerge.js');

const groups = [
	[{ id: 'a1' }, { id: 'a2' }],
	[{ id: 'b1' }, { id: 'b2' }]
];
assert.deepEqual(
	roundRobinHits(groups, 4).map(hit => hit.id),
	['a1', 'b1', 'a2', 'b2']
);

const lanes = [
	{ id: 'likkutei-sichos', title: 'Likkutei Sichos', count: 6000 },
	{ id: 'sefer-hasichos', title: 'Sefer HaSichos', count: 15000 },
	{ id: 'sichos-kodesh', title: 'Sichos Kodesh', count: 48000 }
];
const settled = [
	fulfilled('likkutei-sichos', ['ls-1', 'ls-2']),
	fulfilled('sefer-hasichos', ['sh-1', 'sh-2']),
	{ status: 'rejected', reason: new Error('Incomplete shard set.') }
];
const result = mergeLaneSearches({
	lanes,
	limit: 4,
	query: 'תורה',
	settled,
	totalMs: 25
});

assert.equal(result.shard.id, 'all');
assert.equal(result.shard.count, 69000);
assert.equal(result.lanes.length, 2);
assert.equal(result.laneErrors.length, 1);
assert.equal(result.laneErrors[0].id, 'sichos-kodesh');
assert.deepEqual(
	result.hits.map(hit => hit.id),
	['ls-1', 'sh-1', 'ls-2', 'sh-2']
);
assert.deepEqual(
	result.hits.map(hit => hit.row.libraryLaneId),
	['likkutei-sichos', 'sefer-hasichos', 'likkutei-sichos', 'sefer-hasichos']
);
assert.match(result.message, /2 published libraries/);
assert.equal(result.shard.title, 'All published libraries');
console.log('multiLaneSearch.test passed');

function fulfilled(laneId, ids) {
	return {
		status: 'fulfilled',
		value: {
			mode: 'text',
			index: { persisted: false },
			totalRows: 100,
			timings: { totalMs: 10 },
			hits: ids.map((id, index) => ({
				id,
				rank: index + 1,
				row: { sourceLabel: laneId }
			})),
			commentHits: []
		}
	};
}
