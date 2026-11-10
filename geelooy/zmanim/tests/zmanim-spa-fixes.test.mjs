//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos measures the sun with a full model while each zman keeps its careful edge;
 * Awtsmoos.com tests the NREL sun model, the careful rounding, Jerusalem candles,
 * and the midnight dawn for short summer nights.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { OhrSolarEquations } from "../js/domain/solar-equations.js";
import { ChochmahSolarEvents } from "../js/domain/solar-events.js";
import { TiferesZmanimCalculator } from "../js/domain/zmanim-calculator.js";

const HOUR_MS = 3600000;

/** Full NREL model: declination near the solstices and equation of time near its extremes. */
test("NREL solar position matches published declination and equation of time", () => {
	const june = OhrSolarEquations.solarTerms("2027-06-21", 720);
	assert.ok(Math.abs(OhrSolarEquations.toDegrees(june.declinationRadians) - 23.44) < 0.05);
	const december = OhrSolarEquations.solarTerms("2027-12-21", 720);
	assert.ok(Math.abs(OhrSolarEquations.toDegrees(december.declinationRadians) + 23.44) < 0.05);
	const february = OhrSolarEquations.solarTerms("2027-02-11", 720);
	assert.ok(Math.abs(february.equationMinutes + 14.2) < 0.5);
	const november = OhrSolarEquations.solarTerms("2027-11-03", 720);
	assert.ok(Math.abs(november.equationMinutes - 16.4) < 0.5);
});

/** Fixture with seconds, so rounding has something to do. */
function secondsFixture() {
	return {
		alos: new Date("2026-08-13T04:30:45Z"),
		misheyakir: new Date("2026-08-13T05:15:45Z"),
		trueSunrise: new Date("2026-08-13T06:00:30Z"),
		sunrise: new Date("2026-08-13T06:15:45Z"),
		solarNoon: new Date("2026-08-13T12:00:30Z"),
		sunset: new Date("2026-08-13T17:45:20Z"),
		trueSunset: new Date("2026-08-13T18:00:30Z"),
		tzeis: new Date("2026-08-13T18:30:20Z"),
		shabbosEnd: new Date("2026-08-13T18:50:40Z"),
		nextTrueSunrise: new Date("2026-08-14T06:00:30Z")
	};
}

/** Sun events round down to the minute they occur in; deadlines down, starts up. */
test("careful rounding: sun events and deadlines down, starts up", () => {
	const result = TiferesZmanimCalculator.calculate(secondsFixture(), "chabad");
	assert.equal(result.times.alos.toISOString(), "2026-08-13T04:30:00.000Z");
	assert.equal(result.times.sofShema.toISOString(), "2026-08-13T09:00:00.000Z");
	assert.equal(result.times.sofTefillah.toISOString(), "2026-08-13T10:00:00.000Z");
	assert.equal(result.times.minchaGedola.toISOString(), "2026-08-13T12:31:00.000Z");
	assert.equal(result.times.plag.toISOString(), "2026-08-13T16:46:00.000Z");
	assert.equal(result.times.sunrise.toISOString(), "2026-08-13T06:15:00.000Z");
	assert.equal(result.times.sunset.toISOString(), "2026-08-13T17:45:00.000Z");
	assert.equal(result.times.misheyakir.toISOString(), "2026-08-13T05:16:00.000Z");
	assert.equal(result.times.tzeis.toISOString(), "2026-08-13T18:31:00.000Z");
	assert.equal(result.times.candleLighting.toISOString(), "2026-08-13T17:27:00.000Z");
});

/** Jerusalem lights 40 minutes before sunset; everywhere else 18. */
test("candle lighting is 40 minutes in Jerusalem, 18 elsewhere", () => {
	const fixture = secondsFixture();
	const jerusalem = TiferesZmanimCalculator.calculate(fixture, "chabad", {
		label: "Jerusalem, Israel", latitude: 31.7683, longitude: 35.2137
	});
	assert.equal(jerusalem.times.candleLighting.toISOString(), "2026-08-13T17:05:00.000Z");
	const byCoords = TiferesZmanimCalculator.calculate(fixture, "chabad", {
		label: "Selected coordinates", latitude: 31.77, longitude: 35.21
	});
	assert.equal(byCoords.times.candleLighting.toISOString(), "2026-08-13T17:05:00.000Z");
	const brooklyn = TiferesZmanimCalculator.calculate(fixture, "chabad", {
		label: "Brooklyn, New York", latitude: 40.65, longitude: -73.95
	});
	assert.equal(brooklyn.times.candleLighting.toISOString(), "2026-08-13T17:27:00.000Z");
});

/** Short summer nights: dawn is solar midnight, not unavailable. */
test("dawn on a short London summer night is solar midnight", () => {
	const solar = ChochmahSolarEvents.forDate("2027-06-21", { latitude: 51.5, longitude: -0.12 });
	assert.ok(solar.alos instanceof Date);
	assert.equal(
		solar.alos.getTime(),
		solar.solarNoon.getTime() - 12 * HOUR_MS
	);
	const may = ChochmahSolarEvents.forDate("2027-05-20", { latitude: 51.5, longitude: -0.12 });
	assert.ok(may.alos instanceof Date);
	assert.ok(may.alos.getTime() < may.sunrise.getTime());
});
