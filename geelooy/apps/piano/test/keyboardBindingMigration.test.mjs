//B"H
import test from "node:test";
import assert from "node:assert/strict";

function stubStorage(seed = {}) {
	const map = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
	globalThis.localStorage = {
		getItem: (k) => (map.has(k) ? map.get(k) : null),
		setItem: (k, v) => map.set(k, String(v)),
		removeItem: (k) => map.delete(k)
	};
	return map;
}

const { loadPriorityKeys, resetPriorityKeys } = await import("../modules/keyboard/bindingPreferences.js");
const { COLUMN_KEYS, PIANO_ROW_KEYS } = await import("../modules/keyboard/bindingCatalog.js");

test("fresh profile gets the piano-row default", () => {
	stubStorage();
	assert.deepEqual(loadPriorityKeys(), [...PIANO_ROW_KEYS]);
});

test("previous automatic column default migrates to piano rows", () => {
	const map = stubStorage({ "awtsmoos-piano-desktop-bindings-v8": [...COLUMN_KEYS] });
	assert.deepEqual(loadPriorityKeys(), [...PIANO_ROW_KEYS]);
	assert.deepEqual(JSON.parse(map.get("awtsmoos-piano-desktop-bindings-v9")), [...PIANO_ROW_KEYS]);
});

test("genuine manual custom bindings survive migration untouched", () => {
	const custom = ["m", "n", "b", "v", "c", "x", "z"];
	stubStorage({ "awtsmoos-piano-desktop-bindings-v8": custom });
	assert.deepEqual(loadPriorityKeys(), custom);
});

test("reset returns to piano rows and clears old generations", () => {
	const map = stubStorage({ "awtsmoos-piano-desktop-bindings-v8": [...COLUMN_KEYS] });
	assert.deepEqual(resetPriorityKeys(), [...PIANO_ROW_KEYS]);
	assert.equal(map.has("awtsmoos-piano-desktop-bindings-v8"), false);
});
