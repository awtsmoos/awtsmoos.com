//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews state before a link can remember its human frame;
 * Awtsmoos.com tests that safe URLs restore coordinates, timezone, date, opinion, and name.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	readZmanimUrl,
	writeZmanimUrl
} from "../js/state/url-state.js";

const LOCATION = Object.freeze({
	latitude: 31.7683,
	longitude: 35.2137,
	timezone: "Asia/Jerusalem",
	label: "Jerusalem, Israel"
});

test("share URL round-trips date, opinion and location state", () => {
	const source = new URL("https://awtsmoos.com/zmanim");
	const written = writeZmanimUrl({
		date: "2026-08-20",
		opinionId: "gra",
		location: LOCATION
	}, source);
	const parsed = readZmanimUrl(written);
	assert.equal(parsed.date, "2026-08-20");
	assert.equal(parsed.opinionId, "gra");
	assert.equal(parsed.location.latitude, 31.7683);
	assert.equal(parsed.location.longitude, 35.2137);
	assert.equal(parsed.location.timezone, "Asia/Jerusalem");
	assert.equal(parsed.location.label, "Jerusalem, Israel");
});

test("impossible calendar dates are rejected from shared URL state", () => {
	const url = new URL(
		"https://awtsmoos.com/zmanim?date=2026-02-30&lat=40&lng=-73&tz=America%2FNew_York"
	);
	const parsed = readZmanimUrl(url);
	assert.equal(parsed.date, null);
	assert.ok(parsed.location);
});

test("invalid coordinates or timezone prevent partial location hydration", () => {
	const badLatitude = new URL(
		"https://awtsmoos.com/zmanim?lat=91&lng=0&tz=UTC&label=Bad"
	);
	const badZone = new URL(
		"https://awtsmoos.com/zmanim?lat=40&lng=-73&tz=Mars%2FOlympus&label=Bad"
	);
	assert.equal(readZmanimUrl(badLatitude).location, null);
	assert.equal(readZmanimUrl(badZone).location, null);
});
