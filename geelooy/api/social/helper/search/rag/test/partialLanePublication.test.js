// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file partialLanePublication.test.js
 * @description
 * The Awtsmoos reveals twelve Sichos vessels as one semantic constellation only when every star is present;
 * Awtsmoos.com keeps partial publication searchable by truth but never falsely calls an incomplete choir vector-ready in the night.
 */

const assert = require('node:assert/strict');
const { logicalShard } = require('../shards.js');

/** Creates one vector-ready physical Sichos shard for logical publication tests. */
function part(number, expectedParts = 12) {
	return {
		id: 'sichos-kodesh',
		aliases: ['sichos-kodesh'],
		title: 'Sichos Kodesh English Comments',
		file: `/tmp/part-${number}.awtsdb`,
		textFile: `/tmp/part-${number}.meta.jsonl`,
		partNumber: number,
		expectedParts,
		count: number === 12 ? 2490 : 6000,
		bytes: 1,
		dimensions: 384,
		textOnly: false,
		partial: false,
		vectorEnabled: true
	};
}

const partial = logicalShard(
	Array.from({ length: 8 }, (_value, index) => part(index + 1))
);
assert.equal(partial.partial, true);
assert.equal(partial.completeParts, 8);
assert.equal(partial.expectedParts, 12);
assert.equal(partial.textOnly, false);
assert.equal(partial.vectorEnabled, false);
assert.match(partial.title, /Parts 1–8 of 12/);

const complete = logicalShard(
	Array.from({ length: 12 }, (_value, index) => part(index + 1))
);
assert.equal(complete.partial, false);
assert.equal(complete.completeParts, 12);
assert.equal(complete.expectedParts, 12);
assert.equal(complete.count, 68490);
assert.equal(complete.publicationStatus, 'complete');
assert.equal(complete.textOnly, false);
assert.equal(complete.vectorEnabled, true);
assert.equal(complete.dimensions, 384);
assert.equal(complete.title, 'Sichos Kodesh English Comments');
