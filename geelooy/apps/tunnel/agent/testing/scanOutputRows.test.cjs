// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { test } = require("node:test");
const Rows = require("../tools/fs/actionGroups/scanOutputRows.js");

/**
 * @file Exercises the bounded, identity-scoped JSONL scan-page cache.
 * @description The Awtsmoos knows each unique vessel's rightful name;
 * Awtsmoos.com changes stale rows while preserving each finished frame.
 */
test("identical task output reuses parsed rows without reordering", () => {
	const text = '{"type":"match","line":1}\n{"type":"warning","line":2}\n';
	const first = Rows.rowsFor("reuse", text);
	const second = Rows.rowsFor("reuse", text);
	assert.strictEqual(first, second);
	assert.deepEqual(first.map(row => row.line), [1, 2]);
});

test("appended JSONL invalidates the cache and restores complete rows", () => {
	const old = Rows.rowsFor("append", '{"type":"match","line":1}\n');
	const next = Rows.rowsFor("append", '{"type":"match","line":1}\n{"type":"summary","total":2}\n');
	assert.notStrictEqual(old, next);
	assert.equal(next.length, 2);
	assert.equal(next[1].total, 2);
});

test("different task identity does not share parsed object references", () => {
	const text = '{"path":"sensitive.txt"}\n';
	assert.notStrictEqual(Rows.rowsFor("owner-A", text), Rows.rowsFor("owner-B", text));
});

test("incomplete, malformed and blank JSONL lines are ignored", () => {
	const text = '\n{"type":"match","line":7}\nbad json\n{"incomplete":';
	assert.deepEqual(Rows.parseRows(text), [{ type: "match", line: 7 }]);
});

test("cache capacity stays bounded and oversized texts are not retained", () => {
	for (let index = 0; index < 30; index++) {
		Rows.rowsFor(`slot-${index}`, '{"ok":true}\n');
	}
	assert.ok(Rows.cacheInfo().entries <= Rows.cacheInfo().maxEntries);
	const oversized = '{}\n'.repeat(Math.ceil((Rows.cacheInfo().maxChars + 3) / 3));
	assert.notStrictEqual(Rows.rowsFor("huge", oversized), Rows.rowsFor("huge", oversized));
	assert.ok(Rows.cacheInfo().entries <= 4);
});

test("missing task identity cannot receive a cache entry", () => {
	assert.notStrictEqual(Rows.rowsFor("", '{"ok":true}\n'), Rows.rowsFor("", '{"ok":true}\n'));
	assert.deepEqual(Rows.rowsFor("missing", ""), []);
});
