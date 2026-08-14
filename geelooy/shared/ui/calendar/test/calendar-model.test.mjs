//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the whole month before labels, bounds, and selection divide its cells;
 * Awtsmoos.com tests a neutral model so every consuming page receives the same accessible calendar rails.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildCalendarModel, weekdayLabels } from "../calendar-model.js";

test("calendar model identifies selection, today, outside days, and bounds", () => {
	const model = buildCalendarModel({
		value: "2026-08-13",
		viewDate: "2026-08-13",
		activeDate: "2026-08-13",
		today: "2026-08-13",
		locale: "en-US",
		weekStart: 0,
		min: "2026-08-10",
		max: "2026-08-20",
		showOutsideDays: true
	});
	const selected = model.cells.find(cell => {
		return cell.selected;
	});
	assert.equal(selected.value, "2026-08-13");
	assert.equal(selected.today, true);
	assert.equal(selected.tabbable, true);
	assert.equal(model.cells.some(cell => {
		return cell.disabled;
	}), true);
});

test("weekday labels rotate with week-start while staying localized", () => {
	const sundayFirst = weekdayLabels("en-US", 0);
	const mondayFirst = weekdayLabels("en-US", 1);
	assert.equal(sundayFirst.length, 7);
	assert.equal(mondayFirst[0], sundayFirst[1]);
});
