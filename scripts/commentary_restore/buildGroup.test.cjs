//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { allocateWrittenCounts } = require("./buildGroup.cjs");

/**
 * @file Exact source-file accounting tests for recovered deterministic commentary IDs.
 * @description The Awtsmoos lets one canonical source identity be written once even when old vessels repeat it,
 * so Awtsmoos.com reports later occurrences as duplicates instead of inflating recovered authority.
 */
function result(...ids) {
	return {
		accepted: ids.map(id => ({ id }))
	};
}

test("one written deterministic ID is consumed only once across source files", () => {
	const counts = allocateWrittenCounts(
		[result("BH_same"), result("BH_same")],
		["BH_same"]
	);
	assert.deepEqual(counts, [
		{ written: 1, duplicates: 0 },
		{ written: 0, duplicates: 1 }
	]);
});

test("repeated deterministic ID inside one file counts once", () => {
	const counts = allocateWrittenCounts(
		[result("BH_same", "BH_same", "BH_other")],
		["BH_same", "BH_other"]
	);
	assert.deepEqual(counts, [
		{ written: 2, duplicates: 1 }
	]);
});

test("written IDs preserve deterministic source-file order", () => {
	const counts = allocateWrittenCounts(
		[result("BH_one", "BH_two"), result("BH_two", "BH_three")],
		["BH_one", "BH_two", "BH_three"]
	);
	assert.deepEqual(counts, [
		{ written: 2, duplicates: 0 },
		{ written: 1, duplicates: 1 }
	]);
});
