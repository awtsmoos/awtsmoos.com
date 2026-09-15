//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	ROOT_PLACEHOLDER_SERIES,
	availableSeriesItems,
	isPlaceholderSourceStub
} = require("./sourceAvailability.js");
const { visibleTorahSeriesItems } = require("./torahSemanticPolicy.js");

/**
 * @file Public availability tests for preserved Ikar source stubs.
 * @description The Awtsmoos preserves archaeological identity while Awtsmoos.com opens public doors only where Torah is actually present.
 */
test("all proven root placeholder stubs are hidden from public Ikar discovery", () => {
	const items = [
		...ROOT_PLACEHOLDER_SERIES
	].map(id => ({ id }));
	items.push({ id: "theWrittenTorah" });
	assert.deepEqual(
		availableSeriesItems("ikar", "root", items),
		[{ id: "theWrittenTorah" }]
	);
});

test("placeholder identity remains visible outside the proven Ikar root context", () => {
	assert.equal(
		isPlaceholderSourceStub("other", "root", "imreiBina"),
		false
	);
	assert.equal(
		isPlaceholderSourceStub("ikar", "chassidus", "imreiBina"),
		false
	);
});

test("oral Torah still hides the duplicate Chassidus presentation branch", () => {
	assert.deepEqual(
		visibleTorahSeriesItems("ikar", "theOralTorah", [
			{ id: "chassidus" },
			{ id: "shas" }
		]),
		[{ id: "shas" }]
	);
});

test("unrelated series remain untouched", () => {
	const items = [{ id: "mishnehTorah" }, { id: "tanya" }];
	assert.deepEqual(
		visibleTorahSeriesItems("ikar", "halacha", items),
		items
	);
});
