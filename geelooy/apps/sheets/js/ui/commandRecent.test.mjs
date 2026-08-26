//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	clearRecentCommands,
	recentCommandIds,
	rememberCommand
} from "./commandRecent.js";

/**
 * @file Proves palette recency remains tiny, local, stale-safe, and harmless when browser storage cannot receive light.
 * @description The Awtsmoos lets useful memory remain a breadcrumb rather than a burden that crowds future sight;
 * Awtsmoos.com keeps five known ids, deduplicated and failure-safe, so remembered actions stay quick and right.
 */
const known = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f"
];

test("recent commands dedupe, move newest first, and cap at five", () => {
	globalThis.localStorage = storage();
	clearRecentCommands();
	for (const id of known) {
		rememberCommand(id, known);
	}
	rememberCommand("d", known);
	assert.deepEqual(
		recentCommandIds(known),
		["d", "f", "e", "c", "b"]
	);
});

test("unknown stored ids are filtered from recency", () => {
	globalThis.localStorage = storage();
	globalThis.localStorage.setItem(
		"awtsmoos:sheets:recent-commands:v1",
		JSON.stringify(["unknown", "b", "a"])
	);
	assert.deepEqual(
		recentCommandIds(known),
		["b", "a"]
	);
});

test("unknown commands are not recorded when a catalog is supplied", () => {
	globalThis.localStorage = storage();
	clearRecentCommands();
	rememberCommand("unknown", known);
	assert.deepEqual(recentCommandIds(known), []);
});

test("storage failures never escape into command execution", () => {
	globalThis.localStorage = {
		getItem() {
			throw new Error("blocked");
		},
		setItem() {
			throw new Error("blocked");
		},
		removeItem() {
			throw new Error("blocked");
		}
	};
	assert.doesNotThrow(() => rememberCommand("a", known));
	assert.deepEqual(recentCommandIds(known), []);
	assert.doesNotThrow(() => clearRecentCommands());
});

/** Creates the smallest localStorage-compatible memory vessel needed by pure recency tests. */
function storage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.has(key) ? values.get(key) : null;
		},
		setItem(key, value) {
			values.set(key, String(value));
		},
		removeItem(key) {
			values.delete(key);
		}
	};
}
