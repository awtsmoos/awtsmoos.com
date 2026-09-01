// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multipartVectorSearch.test.js
 * @description
 * The Awtsmoos proves twenty-eight synchronous graph vessels cannot monopolize
 * one event-loop breath; Awtsmoos.com also keeps ranking, counts, provenance,
 * and errors exact while cooperative multipart search yields between parts.
 */

const assert = require('node:assert/strict');
const { searchMultipart } = require('../multipartVectorSearch.js');

function resultFor(part, index) {
	return {
		hits: [{
			rank: 1,
			score: 100 - index,
			row: { id: part.id }
		}],
		totalRows: part.rows,
		source: 'awtsdb-hnsw-persisted',
		index: {
			persisted: true,
			registryCount: part.rows,
			sessionReused: part.reused
		}
	};
}

async function proveYieldAndMerge() {
	const parts = Array.from({ length: 28 }, (_value, index) => ({
		id: `part-${index + 1}`,
		rows: index + 1,
		reused: true
	}));
	const events = [];
	setImmediate(() => events.push('event-loop'));
	const merged = await searchMultipart(parts, (part, index) => {
		events.push(part.id);
		return resultFor(part, index);
	}, 3);
	assert.equal(events[0], 'part-1');
	assert.equal(events[1], 'event-loop');
	assert.equal(events[2], 'part-2');
	assert.equal(merged.hits.length, 3);
	assert.deepEqual(
		merged.hits.map(hit => hit.row.id),
		['part-28', 'part-27', 'part-26']
	);
	assert.deepEqual(merged.hits.map(hit => hit.rank), [1, 2, 3]);
	assert.equal(merged.totalRows, 406);
	assert.equal(merged.index.registryCount, 406);
	assert.equal(merged.index.parts, 28);
	assert.equal(merged.index.sessionReused, true);
}

async function proveSinglePartContract() {
	const part = { id: 'only', rows: 7, reused: false };
	const result = resultFor(part, 0);
	const merged = await searchMultipart([part], () => result, 1);
	assert.equal(merged, result);
}

async function proveErrorPropagation() {
	const error = Object.assign(new Error('index unavailable'), { code: 'INDEX_DOWN' });
	await assert.rejects(
		() => searchMultipart([{ id: 'one' }, { id: 'two' }], part => {
			if (part.id === 'two') throw error;
			return resultFor({ ...part, rows: 1, reused: true }, 0);
		}, 1),
		caught => caught === error
	);
}

async function run() {
	await proveYieldAndMerge();
	await proveSinglePartContract();
	await proveErrorPropagation();
	console.log('multipartVectorSearch.test passed');
}

run().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
