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
 * @description The Awtsmoos preserves archaeological identity while Awtsmoos.com refuses to advertise proven-empty Torah doors through any Ikar presentation alias.
 */
test("all proven placeholder identities are hidden from public Ikar root discovery", () => {
	const items = [...ROOT_PLACEHOLDER_SERIES].map(id => ({ id }));
	items.push({ id: "theWrittenTorah" });
	assert.deepEqual(
		availableSeriesItems("ikar", "root", items),
		[{ id: "theWrittenTorah" }]
	);
});

test("proven-empty identities remain hidden beneath Ikar presentation aliases", () => {
	assert.equal(
		isPlaceholderSourceStub("ikar", "chassidus", "imreiBina"),
		true
	);
	assert.deepEqual(
		visibleTorahSeriesItems("ikar", "chassidus", [
			{ id: "imreiBina" },
			{ id: "seferHatanya" }
		]),
		[{ id: "seferHatanya" }]
	);
});

test("placeholder-like identity outside Ikar remains untouched", () => {
	assert.equal(
		isPlaceholderSourceStub("other", "root", "imreiBina"),
		false
	);
	assert.deepEqual(
		availableSeriesItems("other", "chassidus", [{ id: "imreiBina" }]),
		[{ id: "imreiBina" }]
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

test("unrelated Ikar series remain untouched", () => {
	const items = [{ id: "mishnehTorah" }, { id: "seferHatanya" }];
	assert.deepEqual(
		visibleTorahSeriesItems("ikar", "halacha", items),
		items
	);
});
