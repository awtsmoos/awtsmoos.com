//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the calendar day before month arithmetic can give it a border;
 * Awtsmoos.com tests civil dates in UTC so leap years and month edges remain in order.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	monthGrid,
	shiftDays,
	shiftMonths,
	toIsoDate
} from "../js/components/calendar-math.js";

test("calendar day shifts preserve leap-day arithmetic", () => {
	assert.equal(shiftDays("2024-02-28", 1), "2024-02-29");
	assert.equal(shiftDays("2024-02-28", 2), "2024-03-01");
	assert.equal(shiftDays("2026-01-01", -1), "2025-12-31");
});

test("month shifts pin overflowing days to the target month", () => {
	assert.equal(shiftMonths("2024-01-31", 1), "2024-02-29");
	assert.equal(shiftMonths("2026-01-31", 1), "2026-02-28");
	assert.equal(shiftMonths("2026-12-15", 1), "2027-01-15");
});

test("month grid always emits six Sunday-first weeks", () => {
	const values = monthGrid("2026-08-13");
	assert.equal(values.length, 42);
	assert.equal(new Date(`${values[0]}T00:00:00Z`).getUTCDay(), 0);
	assert.ok(values.includes("2026-08-13"));
	assert.equal(toIsoDate(new Date("2026-08-13T00:00:00Z")), "2026-08-13");
});
