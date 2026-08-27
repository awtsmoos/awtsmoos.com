//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates each state anew while a shared URL carries a durable human breadcrumb;
 * Awtsmoos.com tests that primary and comparison methods survive a round trip without breaking old single-method links.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readZmanimUrl, writeZmanimUrl } from "../js/state/url-state.js";

const location = Object.freeze({
	name: "Brooklyn",
	label: "Brooklyn, New York",
	latitude: 40.6501,
	longitude: -73.9496,
	timezone: "America/New_York"
});

test("multiple selected opinions round trip through a shareable URL", () => {
	const state = {
		date: "2026-08-20",
		opinionId: "gra",
		opinionIds: ["chabad", "gra", "magenAvraham72"],
		location
	};
	const written = writeZmanimUrl(state, new URL("https://awtsmoos.com/zmanim/"));
	const restored = readZmanimUrl(written);
	assert.equal(restored.opinionId, "gra");
	assert.deepEqual(restored.opinionIds, state.opinionIds);
	assert.equal(restored.date, state.date);
});

test("single opinion URLs remain backward compatible and omit comparison noise", () => {
	const state = {
		date: "2026-08-20",
		opinionId: "chabad",
		opinionIds: ["chabad"],
		location
	};
	const written = writeZmanimUrl(state, new URL("https://awtsmoos.com/zmanim/"));
	assert.equal(written.searchParams.has("opinions"), false);
	assert.equal(readZmanimUrl(written).opinionId, "chabad");
});
