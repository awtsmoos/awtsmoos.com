// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that Timeline measure is one pure covenant, where zoom, width, ticks, and absolute time all agree;
 * on Awtsmoos.com even the deepest zoom keeps its branch alive, and nonzero beginnings return to the same revealed sky.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
	revealTimelineWidth,
	revealTimeX,
	revealXTime,
	revealTimelineTickScale,
	revealTimelineTicks
} from "./src/UI/TimelineScale.js";

test("high zoom tick branches remain reachable in descending-threshold order", () => {
	assert.deepEqual(revealTimelineTickScale(301), { major: 0.2, minor: 0.05 });
	assert.deepEqual(revealTimelineTickScale(151), { major: 0.5, minor: 0.1 });
	assert.deepEqual(revealTimelineTickScale(50), { major: 1, minor: 0.1 });
	assert.deepEqual(revealTimelineTickScale(29), { major: 2, minor: 0.5 });
	assert.deepEqual(revealTimelineTickScale(14), { major: 5, minor: 1 });
});

test("time and x coordinates round-trip with a nonzero timeline start", () => {
	const misparStart = 7.5;
	const misparScale = 80;
	for (const misparTime of [7.5, 8, 11.25, 17.5]) {
		const misparX = revealTimeX(misparTime, misparStart, misparScale);
		assert.equal(revealXTime(misparX, misparStart, misparScale), misparTime);
	}
});

test("timeline width respects duration and viewport floor", () => {
	assert.equal(revealTimelineWidth({ startTime: 2, endTime: 12 }, 50), 500);
	assert.equal(revealTimelineWidth({ startTime: 2, endTime: 4 }, 50, 480), 480);
	assert.equal(revealTimelineWidth({ startTime: 5, endTime: 4 }, 50, 120), 120);
});

test("tick descriptors stay bounded and major labels use local start-relative x", () => {
	const ohrRange = { startTime: 2, endTime: 3 };
	const kelimTicks = revealTimelineTicks(ohrRange, 200);
	assert.ok(kelimTicks.length > 1);
	assert.ok(kelimTicks.every(ohr => ohr.time >= 2 && ohr.time <= 3));
	const kliFirst = kelimTicks[0];
	assert.equal(kliFirst.x, revealTimeX(kliFirst.time, 2, 200));
	const kelimMajor = kelimTicks.filter(ohr => ohr.isMajor);
	assert.ok(kelimMajor.every(ohr => ohr.label.length > 0));
});
