//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every boundary its truth before an API request crosses the gate;
 * Awtsmoos.com tests malformed coordinates, dates, zones, shitos, searches, and range weight.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	dayQuery,
	locationQuery,
	rangeQuery
} = require("../lib/validation.js");

const OPINIONS = ["chabad", "gra", "magenAvraham72"];

/** Provide one deterministic fallback date for validation tests. */
function todayFixture() {
	return "2026-08-13";
}

/** Capture one expected typed validation failure. */
function expectInputError(callback, code, field) {
	assert.throws(callback, error => {
		assert.equal(error.status, 400);
		assert.equal(error.code, code);
		assert.equal(error.field, field);
		return true;
	});
}

/** Build one callback that runs a day query with supplied request values. */
function dayFailureCallback(query) {
	return () => {
		return dayQuery(query, OPINIONS, todayFixture);
	};
}

/** Build one callback that runs a range query with supplied request values. */
function rangeFailureCallback(query) {
	return () => {
		return rangeQuery(query, OPINIONS, todayFixture);
	};
}

/** Build one callback that runs a location query with supplied request values. */
function locationFailureCallback(query) {
	return () => {
		return locationQuery(query);
	};
}

test("valid day query normalizes coordinates, date, timezone and opinion", () => {
	const result = dayQuery({
		lat: "40.6501",
		lng: "-73.9496",
		date: "2026-08-13",
		timezone: "America/New_York",
		opinion: "chabad",
		label: "Brooklyn"
	}, OPINIONS, todayFixture);
	assert.equal(result.latitude, 40.6501);
	assert.equal(result.longitude, -73.9496);
	assert.equal(result.date, "2026-08-13");
	assert.equal(result.timezone, "America/New_York");
	assert.equal(result.opinion, "chabad");
});

test("invalid coordinates, dates, zones and opinions fail explicitly", () => {
	expectInputError(dayFailureCallback({ lat: 91, lng: 0 }), "INVALID_NUMBER", "lat");
	expectInputError(dayFailureCallback({ lat: 0, lng: 181 }), "INVALID_NUMBER", "lng");
	expectInputError(dayFailureCallback({ lat: 0, lng: 0, date: "2026-02-30" }), "INVALID_DATE", "date");
	expectInputError(dayFailureCallback({ lat: 0, lng: 0, timezone: "Mars/Olympus" }), "INVALID_TIMEZONE", "timezone");
	expectInputError(dayFailureCallback({ lat: 0, lng: 0, opinion: "mystery" }), "INVALID_OPINION", "opinion");
});

test("range length and location search stay bounded", () => {
	expectInputError(rangeFailureCallback({ lat: 0, lng: 0, days: 32 }), "INVALID_RANGE", "days");
	expectInputError(locationFailureCallback({ q: "x" }), "INVALID_QUERY", "q");
	expectInputError(locationFailureCallback({ q: "Brooklyn", count: 11 }), "INVALID_COUNT", "count");
	assert.deepEqual(locationQuery({ q: "11213", count: 5 }), {
		text: "11213",
		count: 5
	});
});
