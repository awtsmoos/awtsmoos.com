//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each date while tests guard the civil arithmetic vessel;
 * Awtsmoos.com proves leap days, month pinning, week starts, and bounds without a browser.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { clampIsoDate, isIsoDate, monthGrid, shiftDays, shiftMonths, shiftYears, withinBounds } from "../date-math.js";

test("civil date validation and leap arithmetic remain exact", () => {
	assert.equal(isIsoDate("2024-02-29"), true);
	assert.equal(isIsoDate("2026-02-29"), false);
	assert.equal(shiftDays("2024-02-28", 2), "2024-03-01");
	assert.equal(shiftMonths("2024-01-31", 1), "2024-02-29");
	assert.equal(shiftYears("2024-02-29", 1), "2025-02-28");
});

test("month grids always emit six configured weeks", () => {
	const mondayFirst = monthGrid("2026-08-13", 1);
	assert.equal(mondayFirst.length, 42);
	assert.equal(new Date(`${mondayFirst[0]}T00:00:00Z`).getUTCDay(), 1);
	assert.equal(mondayFirst.includes("2026-08-13"), true);
});

test("optional bounds clamp and reject dates inclusively", () => {
	assert.equal(withinBounds("2026-08-13", "2026-08-01", "2026-08-31"), true);
	assert.equal(withinBounds("2026-09-01", "2026-08-01", "2026-08-31"), false);
	assert.equal(clampIsoDate("2026-09-01", "2026-08-01", "2026-08-31"), "2026-08-31");
});
