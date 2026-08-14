//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives the day its life while proportional hours receive their measured share;
 * Awtsmoos.com tests each opinion separately so one convention cannot silently borrow another's air.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { TiferesZmanimCalculator } from "../js/domain/zmanim-calculator.js";

const HOUR_MS = 3600000;

/** Create one deterministic astronomy fixture around a twelve-hour true day. */
function solarFixture() {
	return {
		alos: new Date("2026-08-13T04:30:00Z"),
		misheyakir: new Date("2026-08-13T05:15:00Z"),
		trueSunrise: new Date("2026-08-13T06:00:00Z"),
		sunrise: new Date("2026-08-13T06:15:00Z"),
		solarNoon: new Date("2026-08-13T12:00:00Z"),
		sunset: new Date("2026-08-13T17:45:00Z"),
		trueSunset: new Date("2026-08-13T18:00:00Z"),
		tzeis: new Date("2026-08-13T18:30:00Z"),
		shabbosEnd: new Date("2026-08-13T18:50:00Z"),
		nextTrueSunrise: new Date("2026-08-14T06:00:00Z")
	};
}

/** Compare one Date result to an exact ISO timestamp. */
function assertIso(date, expectedIso) {
	assert.equal(date.toISOString(), expectedIso);
}

test("Chabad profile uses true sunrise and true sunset for seasonal hours", () => {
	const result = TiferesZmanimCalculator.calculate(solarFixture(), "chabad");
	assert.equal(result.shaahMillis, HOUR_MS);
	assertIso(result.dayStart, "2026-08-13T06:00:00.000Z");
	assertIso(result.dayEnd, "2026-08-13T18:00:00.000Z");
	assertIso(result.times.sofShema, "2026-08-13T09:00:00.000Z");
	assertIso(result.times.sofTefillah, "2026-08-13T10:00:00.000Z");
	assertIso(result.times.sofAchilasChametz, "2026-08-13T10:00:00.000Z");
	assertIso(result.times.sofBiur, "2026-08-13T11:00:00.000Z");
	assertIso(result.times.chatzos, "2026-08-13T12:00:00.000Z");
	assertIso(result.times.minchaGedola, "2026-08-13T12:30:00.000Z");
	assertIso(result.times.minchaKetana, "2026-08-13T15:30:00.000Z");
	assertIso(result.times.plag, "2026-08-13T16:45:00.000Z");
});

test("Gra profile measures the standard sunrise-to-sunset day", () => {
	const result = TiferesZmanimCalculator.calculate(solarFixture(), "gra");
	assert.equal(result.shaahMillis / 60000, 57.5);
	assertIso(result.dayStart, "2026-08-13T06:15:00.000Z");
	assertIso(result.dayEnd, "2026-08-13T17:45:00.000Z");
});

test("Magen Avraham fixed-72 profile extends both practical boundaries", () => {
	const result = TiferesZmanimCalculator.calculate(solarFixture(), "magenAvraham72");
	assertIso(result.dayStart, "2026-08-13T05:03:00.000Z");
	assertIso(result.dayEnd, "2026-08-13T18:57:00.000Z");
	assertIso(result.times.candleLighting, "2026-08-13T17:27:00.000Z");
	assertIso(result.times.rabbeinuTam72, "2026-08-13T18:57:00.000Z");
	assertIso(result.times.chatzosHalailah, "2026-08-14T00:00:00.000Z");
});
