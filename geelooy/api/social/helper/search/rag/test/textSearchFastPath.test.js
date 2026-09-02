// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearchFastPath.test.js
 * @description
 * The Awtsmoos proves an exact revealed sefer name needs no giant mirror scan;
 * Awtsmoos.com keeps the ordinary lexical river flowing for every broader plan.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { textSearchShard } = require('../textSearch.js');

test('qualified public title returns canonical identity without file access', async () => {
	const result = await textSearchShard(shard('/path/that/does/not/exist.jsonl'), 'תורה אור (חב"ד)', 8);
	assert.equal(result.identityMatch, true);
	assert.equal(result.source, 'canonical-work-identity');
	assert.equal(result.partsSearched, 0);
	assert.equal(result.scannedRows, 0);
	assert.equal(result.hits[0].row.title, 'תורה אור (חב"ד)');
	assert.equal(result.hits[0].row.pageId, 346791);
	assert.equal(result.hits[0].score, 4);
});

test('ordinary Hebrew query keeps lexical fallback', async t => {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-text-fallback-'));
	t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
	const file = writeRows(folder, 'one.jsonl', [
		{ pageId: 3, title: 'שיחה', text: 'ביאור בענין משיח וגאולה' }
	]);
	const result = await textSearchShard(shard(file), 'משיח', 5);
	assert.equal(result.identityMatch, undefined);
	assert.equal(result.hits.length, 1);
});

test('stable work key remains a lexical query rather than an identity shortcut', async t => {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-text-work-'));
	t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
	const file = writeRows(folder, 'one.jsonl', [
		{ pageId: 4, title: 'תורה אור/בראשית', text: 'תורה אור בפרשת בראשית' }
	]);
	const result = await textSearchShard(shard(file), 'תורה אור', 5);
	assert.equal(result.identityMatch, undefined);
	assert.equal(result.hits.length, 1);
});

function writeRows(folder, name, rows) {
	const file = path.join(folder, name);
	fs.writeFileSync(file, rows.map(row => JSON.stringify(row)).join('\n') + '\n');
	return file;
}

function shard(...files) {
	return {
		id: 'hewikisource-torah',
		title: 'ספריית התורה',
		count: 29345,
		parts: files.map(textFile => ({ textFile, title: 'ספריית התורה' }))
	};
}
