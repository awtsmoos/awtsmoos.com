// B"H

/**
 * @file boundedSidecarSearch.test.js
 * @description
 * Proves text mirrors are searched within explicit limits, report incomplete
 * scans honestly, finish small mirrors completely, and never mutate source data.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { searchSidecar } = require('../sidecarSearch.js');

function fixture(rows) {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-sidecar-'));
	const file = path.join(folder, 'mirror.jsonl');
	fs.writeFileSync(file, `${rows.map(row => JSON.stringify(row)).join('\n')}\n`);
	return { file, folder };
}

function options(file, values = {}) {
	return {
		file,
		queryText: 'rebbe',
		queryTokens: ['rebbe'],
		relevance: row => String(row.text).includes('Rebbe') ? 1 : 0,
		limit: 1,
		shard: { count: values.count, dimensions: 384, title: 'Test Shard' },
		...values
	};
}

test('stops at the row budget and reports truncation without writing', async () => {
	const rows = Array.from({ length: 100 }, (_value, index) => ({
		id: index,
		text: index === 0 ? 'The Rebbe' : `row ${index}`,
		vec: [1, 2, 3]
	}));
	const value = fixture(rows);
	const before = fs.statSync(value.file);
	const result = await searchSidecar(options(value.file, {
		count: rows.length,
		maxRows: 10,
		maxMs: 10_000,
		minRows: 1
	}));
	const after = fs.statSync(value.file);

	assert.equal(result.hits.length, 1);
	assert.equal(result.scannedRows, 10);
	assert.equal(result.truncated, true);
	assert.equal(result.scanComplete, false);
	assert.equal(after.size, before.size);
	assert.equal(after.mtimeMs, before.mtimeMs);
	fs.rmSync(value.folder, { recursive: true, force: true });
});

test('marks a small fully consumed mirror complete', async () => {
	const rows = [{ text: 'The Rebbe' }, { text: 'another row' }];
	const value = fixture(rows);
	const result = await searchSidecar(options(value.file, {
		count: rows.length,
		maxRows: 10,
		maxMs: 10_000,
		minRows: 1
	}));

	assert.equal(result.scannedRows, rows.length);
	assert.equal(result.truncated, false);
	assert.equal(result.scanComplete, true);
	fs.rmSync(value.folder, { recursive: true, force: true });
});
