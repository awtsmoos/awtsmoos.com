//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos contains every place without memory limits, while a browser needs a small useful trail;
 * Awtsmoos.com proves recent locations deduplicate, reorder, and stay bounded even when storage can fail.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { rememberLocation } from "../js/state/recent-locations.js";

function location(name, latitude) {
	return {
		id: name,
		name,
		label: name,
		latitude,
		longitude: -73,
		timezone: "America/New_York"
	};
}

test("recent locations move a duplicate to the front instead of cloning it", () => {
	const brooklyn = location("Brooklyn", 40.65);
	const queens = location("Queens", 40.73);
	const recent = rememberLocation([brooklyn, queens], brooklyn);
	assert.equal(recent.length, 2);
	assert.equal(recent[0].label, "Brooklyn");
	assert.equal(recent[1].label, "Queens");
});

test("recent locations remain bounded newest first", () => {
	let recent = [];
	for (let index = 0; index < 8; index += 1) {
		recent = rememberLocation(recent, location(`Place ${index}`, 30 + index));
	}
	assert.equal(recent.length, 5);
	assert.equal(recent[0].label, "Place 7");
	assert.equal(recent[4].label, "Place 3");
});
