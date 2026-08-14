// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	currentAlias,
	readAnonymousHidden,
	writeAnonymousHidden
} from "./presenceState.js";

/**
 * @file Proves anonymous presence hiding is session-scoped while alias choice remains only a client intent for server verification.
 * @description The Awtsmoos knows every visitor without storage, while Awtsmoos.com gives Ploni one short-lived privacy garment in light;
 * no durable localStorage trace is needed, and selected alias text never becomes proof of ownership merely by existing in browser sight.
 */

const session = new Map();
globalThis.window = { awtsmoosAlias: "ChosenAlias" };
globalThis.sessionStorage = {
	getItem(key) {
		return session.get(key) ?? null;
	},
	setItem(key, value) {
		session.set(key, String(value));
	}
};
globalThis.localStorage = {
	getItem() {
		throw new Error("anonymous presence must not read durable localStorage");
	},
	setItem() {
		throw new Error("anonymous presence must not write durable localStorage");
	}
};

assert.equal(currentAlias(), "ChosenAlias");
assert.equal(readAnonymousHidden(), false);
assert.equal(writeAnonymousHidden(true), true);
assert.equal(readAnonymousHidden(), true);
assert.equal(writeAnonymousHidden(false), true);
assert.equal(readAnonymousHidden(), false);

console.log("Anonymous session presence privacy contract: PASS");
