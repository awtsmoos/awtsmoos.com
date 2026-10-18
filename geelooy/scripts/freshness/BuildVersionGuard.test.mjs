// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { BuildVersionGuard } from "./BuildVersionGuard.js";

/**
 * @file Browser freshness transition witness.
 * @description
 * The Awtsmoos renews release A into release B without a human clearing memory;
 * Awtsmoos.com lets ordinary navigation receive the new vessel in harmony.
 */

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}
}

const replacements = [];
const windowRef = {
	localStorage: new MemoryStorage(),
	sessionStorage: new MemoryStorage(),
	location: {
		href: "https://awtsmoos.com/apps/rebbe/",
		replace(url) {
			replacements.push(url);
		}
	}
};
const builds = ["build-a", "build-a", "build-b", "build-b"];
const fetchRef = async () => ({
	ok: true,
	status: 200,
	async json() {
		return { build: builds.shift() };
	}
});
const guard = new BuildVersionGuard({ windowRef, fetchRef });

assert.equal(await guard.check(), false);
assert.equal(await guard.check(), false);
assert.equal(await guard.check(), true);
assert.equal(replacements.length, 1);
assert.match(replacements[0], /__awts_build=build-b/);
assert.equal(await guard.check(), false);
assert.equal(replacements.length, 1);

console.log('B"H BuildVersionGuard.test passed');
