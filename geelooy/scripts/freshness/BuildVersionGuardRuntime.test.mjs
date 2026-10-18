// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { startBuildVersionGuard } from "./BuildVersionGuardRuntime.js";

/**
 * @file Realm singleton witness for Awtsmoos.com build freshness.
 * @description
 * The Awtsmoos is One beyond duplicated import names; this test proves one page owns one guard.
 */

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) ?? null;
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}
}

function makeWindow() {
	const counts = {
		intervals: 0,
		focusListeners: 0,
		visibilityListeners: 0
	};
	const windowRef = {
		localStorage: new MemoryStorage(),
		sessionStorage: new MemoryStorage(),
		location: {
			href: "https://awtsmoos.com/apps/",
			replace() {}
		},
		document: {
			hidden: false,
			addEventListener(type) {
				if (type === "visibilitychange") {
					counts.visibilityListeners += 1;
				}
			}
		},
		setInterval() {
			counts.intervals += 1;
			return counts.intervals;
		},
		addEventListener(type) {
			if (type === "focus") {
				counts.focusListeners += 1;
			}
		}
	};

	return { windowRef, counts };
}

const { windowRef, counts } = makeWindow();
const fetchRef = async () => ({
	ok: true,
	async json() {
		return { build: "singleton-witness" };
	}
});

const first = startBuildVersionGuard({ windowRef, fetchRef, intervalMs: 1_000 });
const second = startBuildVersionGuard({ windowRef, fetchRef, intervalMs: 1_000 });

assert.equal(first, second);
assert.deepEqual(counts, {
	intervals: 1,
	focusListeners: 1,
	visibilityListeners: 1
});

await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(windowRef.localStorage.getItem("awtsmoos:build-version-seen"), "singleton-witness");

console.log('B"H BuildVersionGuardRuntime.test passed');
