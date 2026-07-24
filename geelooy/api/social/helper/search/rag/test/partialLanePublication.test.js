// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file partialLanePublication.test.js
 * @description
 * Multipart publication must preserve all reviewed sidecars, expose truthful
 * completeness metadata, and refuse vector entry for the partial lane.
 */

const assert = require('node:assert/strict');
const {
	logicalShard
} = require('../shards.js');
const {
	assertVectorSupported
} = require('../sourceSearch.js');
const { mergeTextParts } = require('../textSearchParts.js');

const parts = Array.from({ length: 8 }, (_value, index) => ({
	id: 'sichos-kodesh',
	title: 'Sichos Kodesh English Comments',
	aliases: ['sichos-kodesh', 'sk'],
	count: 6000,
	bytes: 100,
	partNumber: index + 1,
	partial: true,
	expectedParts: 12,
	textOnly: true,
	textFile: `/tmp/part-${index + 1}.meta.jsonl`
}));
const lane = logicalShard(parts);
assert.equal(lane.count, 48000);
assert.equal(lane.completeParts, 8);
assert.equal(lane.expectedParts, 12);
assert.equal(lane.partial, true);
assert.equal(lane.textOnly, true);
assert.equal(lane.parts.length, 8);
assert.match(lane.title, /Parts 1–8 of 12/);
assert.throws(() => assertVectorSupported(lane), error => error.code === 'PARTIAL_LANE_TEXT_ONLY');
const merged = mergeTextParts([
	{ hits: [{ score: 0.8, row: { id: 'a' } }], scannedRows: 10, scanComplete: true },
	{ hits: [{ score: 0.9, row: { id: 'b' } }], scannedRows: 12, scanComplete: true }
], 2, lane);
assert.deepEqual(merged.hits.map(hit => hit.row.id), ['b', 'a']);
assert.equal(merged.partsSearched, 2);
assert.equal(merged.scannedRows, 22);
console.log('partialLanePublication.test passed');
