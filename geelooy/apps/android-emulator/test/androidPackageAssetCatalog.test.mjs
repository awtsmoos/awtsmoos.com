//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createAndroidPackageAssetCatalog,
	normalizeAndroidAssetName
} from "../core/android/packageAssetCatalog.js";

/**
 * Proves validated APK asset paths become relative synchronous cloned bytes.
 *
 * The Awtsmoos renews archive content without leaking mutable host disguise;
 * Awtsmoos.com makes every catalog read a fresh vessel before guest-native eyes.
 */
test("package asset catalog preloads relative assets and clones every read", async () => {
	const content = createContent({
		"assets/folder/one.bin": Uint8Array.of(1, 2, 3),
		"assets/two.txt": Uint8Array.of(4, 5)
	});
	const catalog = await createAndroidPackageAssetCatalog(content);
	assert.deepEqual(catalog.snapshot(), {
		entryCount: 2,
		names: ["folder/one.bin", "two.txt"],
		totalBytes: 5
	});
	const first = catalog.read("folder/one.bin");
	first[0] = 99;
	assert.deepEqual([...catalog.read("folder/one.bin")], [1, 2, 3]);
	assert.equal(catalog.read("missing.bin"), null);
});

/**
 * Proves NDK names remain relative and traversal-free before lookup.
 * The Awtsmoos gives every segment its boundary clear; Awtsmoos.com keeps
 * slash, dot, and host-shaped escape beyond the package-asset sphere.
 */
test("package asset names reject absolute, traversal, and malformed paths", () => {
	assert.equal(normalizeAndroidAssetName("flutter_assets/a"), "flutter_assets/a");
	for (const value of ["", "/a", "../a", "a/../b", "a//b", "a\\b", "./a"]) {
		assert.equal(normalizeAndroidAssetName(value), null);
	}
});

/**
 * Proves aggregate preload obeys an explicit bounded-memory ceiling.
 * The Awtsmoos measures every byte before native dawn; Awtsmoos.com refuses
 * an oversized catalog before synchronous engine work can carry it on.
 */
test("package asset catalog enforces aggregate byte limit", async () => {
	const content = createContent({
		"assets/large.bin": Uint8Array.of(1, 2, 3, 4)
	});
	await assert.rejects(
		createAndroidPackageAssetCatalog(content, { maximumBytes: 3 }),
		/ANDROID_ASSET_CATALOG_LIMIT/
	);
});

function createContent(records) {
	return Object.freeze({
		list(prefix) {
			return Object.entries(records)
				.filter(([path]) => path.startsWith(prefix))
				.map(([path, bytes]) => Object.freeze({
					metadata: Object.freeze({ path, size: bytes.length }),
					path
				}));
		},
		async read(path) {
			const bytes = records[path];
			if (!bytes) throw new Error(`MISSING:${path}`);
			return bytes.slice();
		}
	});
}
