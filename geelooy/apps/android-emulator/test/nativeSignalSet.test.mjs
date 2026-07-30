//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	addNativeSignal,
	createEmptyNativeSignalSet,
	createFullNativeSignalSet,
	deleteNativeSignal,
	hasNativeSignal,
	NATIVE_SIGNAL_SET_BYTES
} from "../core/native/nativeSignalSet.js";

test("signal sets preserve 128-byte Android layout and numbered bits", () => {
	const empty = createEmptyNativeSignalSet();
	assert.equal(empty.length, NATIVE_SIGNAL_SET_BYTES);
	assert.equal(addNativeSignal(empty, 1), true);
	assert.equal(addNativeSignal(empty, 64), true);
	assert.equal(hasNativeSignal(empty, 1), true);
	assert.equal(hasNativeSignal(empty, 64), true);
	assert.equal(deleteNativeSignal(empty, 1), true);
	assert.equal(hasNativeSignal(empty, 1), false);
	assert.equal(createFullNativeSignalSet().every(value => value === 0xff), true);
	assert.equal(addNativeSignal(empty, 65), false);
});
