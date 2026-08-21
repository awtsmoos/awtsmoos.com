//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One while a comparison set may contain many chosen vessels;
 * Awtsmoos.com tests that duplicates, unknown IDs, empty sets, and primary selection remain orderly.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	allSupportedOpinionIds,
	normalizeOpinionIds,
	normalizePrimaryOpinion
} from "../js/config/opinion-selection.js";

test("opinion selection removes unknown and duplicate IDs in stable order", () => {
	assert.deepEqual(
		normalizeOpinionIds(["gra", "unknown", "gra", "chabad"]),
		["gra", "chabad"]
	);
});

test("empty opinion selection returns the safe Chabad default", () => {
	assert.deepEqual(normalizeOpinionIds([]), ["chabad"]);
	assert.deepEqual(normalizeOpinionIds(""), ["chabad"]);
});

test("primary opinion must belong to the selected set", () => {
	assert.equal(normalizePrimaryOpinion("gra", ["gra", "chabad"]), "gra");
	assert.equal(normalizePrimaryOpinion("magenAvraham72", ["gra", "chabad"]), "gra");
});

test("all supported profiles expose the comparison universe", () => {
	const opinionIds = allSupportedOpinionIds();
	assert.equal(opinionIds.length, 9);
	assert.ok(opinionIds.includes("magenAvraham72Zmaniyos"));
	assert.ok(opinionIds.includes("magenAvraham16_1"));
});
