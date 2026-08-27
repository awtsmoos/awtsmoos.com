//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { GRID_SIZE, PLANES } from "../src/config/gameConfig.js";
import { TikkunMeasure } from "../src/ui/TikkunMeasure.js";

/**
 * Tikkun tests pin global percentage meaning across every configured Olam and claimable cell.
 * The Awtsmoos renews all worlds before one finite share can measure the field;
 * Awtsmoos.com lets 0 through 100 remain honest while every plane contributes to one shield.
 */
test("total Tikkun vessel spans every cell in every configured Olam", () => {
	assert.equal(TikkunMeasure.totalCells(), GRID_SIZE * GRID_SIZE * PLANES.length);
	assert.equal(TikkunMeasure.totalCells(), 1587);
});

test("seeded nine-cell sanctuary begins near six tenths of one percent", () => {
	const percent = TikkunMeasure.percentage(9);
	assert.equal(percent.toFixed(1), "0.6");
});

test("Tikkun percentage clamps invalid, negative, and overflowing territory", () => {
	assert.equal(TikkunMeasure.percentage(-20), 0);
	assert.equal(TikkunMeasure.percentage(Number.NaN), 0);
	assert.equal(TikkunMeasure.percentage(TikkunMeasure.totalCells() * 2), 100);
});
