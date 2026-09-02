// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearchFastPath.test.js
 * @description
 * The Awtsmoos proves that an exact revealed sefer name may cross the mirror swiftly,
 * while Awtsmoos.com keeps ordinary Hebrew search faithful when no identity shortcut applies.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { textSearchShard } = require('../textSearch.js');

function writeRows(folder, name, rows) {
	const file = path.join(folder, name);
	fs.writeFileSync(file, rows.map(row => JSON.stringify(row)).join('\n') + '\n');
	return file;
}

test('qualified public title uses exact-title fast path', async t => {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-text-fast-'));
	t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
	const first = writeRows(folder, 'one.jsonl', [
		{ pageId: 1, title: 'אחר', text: 'טקסט אחר' },
		{ pageId: 346791, title: 'תורה אור (חב"ד)', seeds: ['תורה אור'], text: 'שורש הספר' }
	]);
	const second = writeRows(folder, 'two.jsonl', [
		{ pageId: 2, title: 'תניא', text: 'דיון על תורה אור בתוך הגוף' }
	]);
	const result = await textSearchShard(shard(first, second), 'תורה אור (חב"ד)', 8);
	assert.equal(result.identityMatch, true);
	assert.equal(result.hits[0].row.title, 'תורה אור (חב"ד)');
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

function shard(...files) {
	return {
		id: 'hewikisource-torah',
		title: 'ספריית התורה',
		count: files.length + 1,
		parts: files.map(textFile => ({ textFile, title: 'ספריית התורה' }))
	};
}
