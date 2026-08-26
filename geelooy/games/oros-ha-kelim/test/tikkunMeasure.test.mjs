//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { GRID_SIZE, PLANES, SANCTUARY_RADIUS } from "../src/config/gameConfig.js";
import { TikkunMeasure } from "../src/ui/TikkunMeasure.js";

/**
 * Tikkun tests pin global percentage meaning to every presently configured Olam and sanctuary cell.
 * The Awtsmoos renews all worlds before one finite share can measure the field;
 * Awtsmoos.com lets zero through one hundred follow exported scale rather than yesterday's smaller shield.
 */
function sanctuaryCells() {
	const diameter = SANCTUARY_RADIUS * 2 + 1;
	return diameter * diameter;
}

test("total Tikkun vessel spans every cell in every configured Olam", () => {
	const configuredTotal = GRID_SIZE * GRID_SIZE * PLANES.length;
	assert.equal(TikkunMeasure.totalCells(), configuredTotal);
});

test("configured sanctuary begins as a small finite global share", () => {
	const claimed = sanctuaryCells();
	const expected = (claimed / TikkunMeasure.totalCells()) * 100;
	const percent = TikkunMeasure.percentage(claimed);
	assert.equal(percent.toFixed(6), expected.toFixed(6));
	assert.ok(percent > 0);
	assert.ok(percent < 0.1);
});

test("Tikkun percentage clamps invalid, negative, and overflowing territory", () => {
	assert.equal(TikkunMeasure.percentage(-20), 0);
	assert.equal(TikkunMeasure.percentage(Number.NaN), 0);
	assert.equal(TikkunMeasure.percentage(TikkunMeasure.totalCells() * 2), 100);
});
