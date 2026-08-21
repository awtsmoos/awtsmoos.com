//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates one sky while distinct halachic profiles draw their boundaries by different rules;
 * Awtsmoos.com tests those rules directly so fixed, proportional, and degree-based methods never become mislabeled tools.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { TiferesZmanimCalculator } from "../js/domain/zmanim-calculator.js";

const solar = Object.freeze({
	sunrise: new Date("2026-08-20T10:00:00Z"),
	sunset: new Date("2026-08-20T20:00:00Z"),
	trueSunrise: new Date("2026-08-20T09:55:00Z"),
	trueSunset: new Date("2026-08-20T20:05:00Z"),
	alos16_1: new Date("2026-08-20T08:35:00Z"),
	tzeis16_1: new Date("2026-08-20T21:25:00Z")
});

function isoTime(date) {
	return date?.toISOString().slice(11, 16);
}

test("fixed-minute profiles extend sunrise and sunset by ordinary minutes", () => {
	const boundaries = TiferesZmanimCalculator.dayBoundaries(solar, "magenAvraham72");
	assert.equal(isoTime(boundaries.start), "08:48");
	assert.equal(isoTime(boundaries.end), "21:12");
});

test("zmaniyos-minute profiles scale from that date's daylight span", () => {
	const seventyTwo = TiferesZmanimCalculator.dayBoundaries(solar, "magenAvraham72Zmaniyos");
	const ninety = TiferesZmanimCalculator.dayBoundaries(solar, "magenAvraham90Zmaniyos");
	const ninetySix = TiferesZmanimCalculator.dayBoundaries(solar, "magenAvraham96Zmaniyos");
	assert.deepEqual([isoTime(seventyTwo.start), isoTime(seventyTwo.end)], ["09:00", "21:00"]);
	assert.deepEqual([isoTime(ninety.start), isoTime(ninety.end)], ["08:45", "21:15"]);
	assert.deepEqual([isoTime(ninetySix.start), isoTime(ninetySix.end)], ["08:40", "21:20"]);
});

test("degree and Chabad profiles use their configured solar anchors", () => {
	const degree = TiferesZmanimCalculator.dayBoundaries(solar, "magenAvraham16_1");
	const chabad = TiferesZmanimCalculator.dayBoundaries(solar, "chabad");
	assert.equal(degree.start, solar.alos16_1);
	assert.equal(degree.end, solar.tzeis16_1);
	assert.equal(chabad.start, solar.trueSunrise);
	assert.equal(chabad.end, solar.trueSunset);
});
