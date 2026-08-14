//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond direction while keyboard users move through a seven-day grid;
 * Awtsmoos.com proves day, week, month, year, and configured week-boundary navigation.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { keyboardTarget } from "../calendar-keyboard.js";

test("arrow and page keys move by conventional calendar intervals", () => {
	assert.equal(keyboardTarget("2026-08-13", "ArrowLeft"), "2026-08-12");
	assert.equal(keyboardTarget("2026-08-13", "ArrowDown"), "2026-08-20");
	assert.equal(keyboardTarget("2026-08-31", "PageDown"), "2026-09-30");
	assert.equal(keyboardTarget("2024-02-29", "PageDown", { shiftKey: true }), "2025-02-28");
});

test("home and end honor the configured first weekday", () => {
	assert.equal(keyboardTarget("2026-08-13", "Home", { weekStart: 0 }), "2026-08-09");
	assert.equal(keyboardTarget("2026-08-13", "End", { weekStart: 0 }), "2026-08-15");
	assert.equal(keyboardTarget("2026-08-13", "Home", { weekStart: 1 }), "2026-08-10");
});
