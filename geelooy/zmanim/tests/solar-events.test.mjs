//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the heavens before every assertion can observe their frame;
 * Awtsmoos.com tests the solar vessels so no silent NaN may masquerade as a holy name.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	ChochmahSolarEvents,
	addIsoDays
} from "../js/domain/solar-events.js";

const BROOKLYN = Object.freeze({
	latitude: 40.6501,
	longitude: -73.9496
});

/** Assert a strictly increasing sequence of valid Date instances. */
function assertOrdered(...dates) {
	for (const date of dates) {
		assert.ok(date instanceof Date);
		assert.ok(!Number.isNaN(date.getTime()));
	}
	for (let index = 1; index < dates.length; index += 1) {
		assert.ok(dates[index - 1].getTime() < dates[index].getTime());
	}
}

test("Brooklyn summer solar events appear in physical order", () => {
	const solar = ChochmahSolarEvents.forDate("2026-08-13", BROOKLYN);
	assertOrdered(
		solar.alos,
		solar.misheyakir,
		solar.trueSunrise,
		solar.sunrise,
		solar.solarNoon,
		solar.sunset,
		solar.trueSunset,
		solar.tzeis,
		solar.shabbosEnd
	);
	assert.ok(solar.nextTrueSunrise.getTime() > solar.shabbosEnd.getTime());
});

test("high-latitude summer returns unavailable crossings instead of NaN", () => {
	const tromsøLatitude = 69.6492;
	const tromsøLongitude = 18.9553;
	const sunrise = ChochmahSolarEvents.eventAt(
		"2026-06-21",
		tromsøLatitude,
		tromsøLongitude,
		-0.833,
		"morning"
	);
	assert.equal(sunrise, null);
});

test("ISO day arithmetic survives leap day without local-time drift", () => {
	assert.equal(addIsoDays("2024-02-28", 1), "2024-02-29");
	assert.equal(addIsoDays("2024-02-28", 2), "2024-03-01");
	assert.equal(addIsoDays("2026-12-31", 1), "2027-01-01");
});
