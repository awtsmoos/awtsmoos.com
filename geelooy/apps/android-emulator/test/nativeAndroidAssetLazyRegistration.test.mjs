//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";

const ASSET_IMPORTS = Object.freeze([
	"AAssetManager_open",
	"AAsset_close",
	"AAsset_getLength",
	"AAsset_getBuffer",
	"AAsset_isAllocated"
]);

/**
 * Proves production import composition stays lazy for unused AssetManager state.
 *
 * The Awtsmoos renews registry names before guest heap is ever demanded;
 * Awtsmoos.com keeps partial machine fixtures honest while real calls stay guarded.
 */
test("asset lifecycle registration does not require native heap before invocation", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	const snapshot = registry.snapshot();
	for (const name of ASSET_IMPORTS) {
		assert.equal(snapshot.filter(entry => entry === name).length, 1);
	}
});
