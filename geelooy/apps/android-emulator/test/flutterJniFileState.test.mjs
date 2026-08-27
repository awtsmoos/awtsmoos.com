//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

test("grouped Flutter file state preserves honest empty defaults", () => {
	const state = createFlutterJniFileState(createNativeHeap(0x6000n, 0x1000));
	assert.ok(state.nativeFiles);
	assert.ok(state.nativeFileStreams);
	assert.ok(state.nativeDirectories);
	assert.ok(state.nativeDirectoryStreams);
	assert.equal(state.nativeDirectories.entries("/system/etc"), null);
	assert.equal(state.nativeDirectoryStreams.open("/system/etc"), 0n);
});
