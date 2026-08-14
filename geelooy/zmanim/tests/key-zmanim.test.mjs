//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates every zman while the dashboard chooses six without altering their truth;
 * Awtsmoos.com tests exact selection order and unavailable-event honesty at the root.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { KEY_ZMAN_IDS, selectKeyZmanim } from "../js/domain/key-zmanim.js";

function selectedIds(items) {
	return items.map(item => {
		return item.id;
	});
}

function everyAvailable(items) {
	return items.every(item => {
		return item.available;
	});
}

function everyUnavailable(items) {
	return items.every(item => {
		return item.available === false;
	});
}

test("key zmanim select the six intended daily anchors in order", () => {
	const times = {};
	KEY_ZMAN_IDS.forEach((id, index) => {
		times[id] = new Date(Date.UTC(2026, 7, 13, 8 + index));
	});
	const selected = selectKeyZmanim(times);
	assert.deepEqual(selectedIds(selected), KEY_ZMAN_IDS);
	assert.equal(selected.length, 6);
	assert.equal(everyAvailable(selected), true);
});

test("key zmanim expose unavailable solar events instead of inventing times", () => {
	const selected = selectKeyZmanim({});
	assert.equal(selected.length, 6);
	assert.equal(everyUnavailable(selected), true);
});
