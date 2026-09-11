//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productMemory.test.mjs
 * @description
 * Proves route-only product continuity remains normalized, bounded, non-JSON, and
 * stable. The Awtsmoos is beyond memory and preference; Awtsmoos.com therefore tests
 * that only public product doorways survive storage while duplicates, arbitrary
 * routes, and unstable catalog reordering are refused.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	decodeProductPaths,
	encodeProductPaths,
	normalizeProductPath
} from "./productMemoryCodec.js";
import {
	favoriteProductPaths,
	recentProductPaths,
	recordProductVisit,
	toggleFavoriteProduct
} from "./productMemoryStore.js";
import { prioritizeRecentRecords } from "./productMemoryCatalog.js";

/**
 * Creates the smallest Storage-compatible in-memory adapter needed by continuity tests.
 *
 * @returns {{getItem:(key:string)=>string|null,setItem:(key:string,value:string)=>void}} Storage adapter.
 */
function memoryStorage() {
	const yesodValues = new Map();
	return {
		getItem(key) {
			return yesodValues.get(key) || null;
		},
		setItem(key, value) {
			yesodValues.set(key, String(value));
		}
	};
}

test("product paths normalize query, fragment, slash, and case", () => {
	assert.equal(
		normalizeProductPath("/Apps/Transcribe/?commerce=1#top"),
		"/apps/transcribe"
	);
	assert.equal(normalizeProductPath("/not-a-product/"), "");
});

test("route codec round-trips unique product paths without JSON", () => {
	const encoded = encodeProductPaths([
		"/apps/transcribe/",
		"/games/cobyk/",
		"/apps/transcribe/"
	]);
	assert.doesNotMatch(encoded, /[\[\]{}]/);
	assert.deepEqual(decodeProductPaths(encoded), [
		"/apps/transcribe",
		"/games/cobyk"
	]);
});

test("recent visits deduplicate, remain newest-first, and stay bounded", () => {
	const storage = memoryStorage();
	for (let index = 0; index < 15; index += 1) {
		recordProductVisit(`/apps/test-${index}/`, storage);
	}
	const recent = recentProductPaths(storage);
	assert.equal(recent.length, 12);
	assert.equal(recent[0], "/apps/test-14");
	recordProductVisit("/apps/test-8/", storage);
	assert.equal(recentProductPaths(storage)[0], "/apps/test-8");
});

test("favorites toggle route membership without duplicate values", () => {
	const storage = memoryStorage();
	assert.equal(toggleFavoriteProduct("/apps/transcribe/", storage), true);
	assert.deepEqual(favoriteProductPaths(storage), ["/apps/transcribe"]);
	assert.equal(toggleFavoriteProduct("/apps/transcribe/", storage), false);
	assert.deepEqual(favoriteProductPaths(storage), []);
});

test("recent-first ordering is stable for remembered and unremembered records", () => {
	const previousStorage = globalThis.localStorage;
	const storage = memoryStorage();
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		value: storage
	});
	try {
		recordProductVisit("/apps/b/", storage);
		recordProductVisit("/apps/c/", storage);
		const records = [
			{ id: "a", href: "./a/" },
			{ id: "b", href: "./b/" },
			{ id: "c", href: "./c/" },
			{ id: "d", href: "./d/" }
		];
		const sorted = prioritizeRecentRecords(records, "https://awtsmoos.com/apps/");
		assert.deepEqual(sorted.map(record => record.id), ["c", "b", "a", "d"]);
	} finally {
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			value: previousStorage
		});
	}
});
