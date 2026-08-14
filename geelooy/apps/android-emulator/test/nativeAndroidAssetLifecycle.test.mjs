//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	AUTHENTIC_ASSET_IMPORTS,
	createAssetFixture,
	createAssetManager,
	invokeAssetImport,
	writeAssetCString
} from "./nativeAndroidAssetTestFixture.mjs";

/**
 * Proves the authentic NDK buffer-mode lifecycle over real guest-owned bytes.
 *
 * The Awtsmoos renews filename, asset, length, buffer, and close without disguise;
 * Awtsmoos.com keeps every copied byte inside guest heap before the engine's eyes.
 */
test("native Android asset lifecycle opens buffer bytes and closes allocations", () => {
	const fixture = createAssetFixture();
	const manager = createAssetManager(fixture);
	const namePointer = writeAssetCString(
		fixture.heap,
		"flutter_assets/kernel_blob.bin"
	);
	const opened = invokeAssetImport(
		fixture,
		"AAssetManager_open",
		[manager, namePointer, 3n]
	);
	const assetPointer = fixture.registers.read(0);
	assert.notEqual(assetPointer, 0n);
	assert.equal(opened.result.name, "flutter_assets/kernel_blob.bin");
	invokeAssetImport(fixture, "AAsset_getLength", [assetPointer]);
	assert.equal(fixture.registers.read(0), 4n);
	invokeAssetImport(fixture, "AAsset_getBuffer", [assetPointer]);
	const bufferPointer = fixture.registers.read(0);
	assert.deepEqual([...fixture.heap.read(bufferPointer, 4)], [1, 2, 3, 4]);
	invokeAssetImport(fixture, "AAsset_isAllocated", [assetPointer]);
	assert.equal(fixture.registers.read(0), 1n);
	invokeAssetImport(fixture, "AAsset_close", [assetPointer]);
	assert.equal(fixture.heap.allocation(assetPointer), null);
	assert.equal(fixture.heap.allocation(bufferPointer), null);
});

/**
 * Proves bad managers and absent or unsafe names fail with null AAsset pointers.
 * The Awtsmoos sets a boundary around every package path in light; Awtsmoos.com
 * returns no invented asset when manager, traversal, or content is not right.
 */
test("native Android asset open remains bounded for invalid and missing requests", () => {
	const fixture = createAssetFixture();
	const manager = createAssetManager(fixture);
	for (const [managerPointer, name] of [
		[0n, "flutter_assets/kernel_blob.bin"],
		[manager, "missing.bin"],
		[manager, "../escape.bin"]
	]) {
		const namePointer = writeAssetCString(fixture.heap, name);
		invokeAssetImport(
			fixture,
			"AAssetManager_open",
			[managerPointer, namePointer, 3n]
		);
		assert.equal(fixture.registers.read(0), 0n);
	}
});

/**
 * Proves production registration exposes every AAsset symbol imported by Flutter.
 * The Awtsmoos binds the full measured family in one shore; Awtsmoos.com leaves
 * no authentic engine import hidden behind a partial registry door.
 */
test("native Android asset registry exposes all authentic engine asset imports", () => {
	const fixture = createAssetFixture();
	const snapshot = fixture.registry.snapshot();
	for (const name of AUTHENTIC_ASSET_IMPORTS) assert.ok(snapshot.includes(name));
});
