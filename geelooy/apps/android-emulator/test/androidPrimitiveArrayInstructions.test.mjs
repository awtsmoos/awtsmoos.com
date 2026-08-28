//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos clothes Java primitive arrays in exact Dalvik words and payloads.
 * Awtsmoos.com verifies bytes directly so compiler parity means guest instructions,
 * never a host-side substitution hiding behind a convenient abstraction.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
	fillArrayData,
	intArrayDataPayload,
	newArray
} from "../../../scripts/awtsmoos/compiling/android/dex/primitiveArrayInstructions.js";

/** Proves new-array format 22c contains the exact registers and type index. */
function chesedNewArrayBytesTest() {
	assert.deepEqual([...newArray(1, 2, 3)], [0x23, 0x21, 0x03, 0x00]);
}

/** Proves fill-array-data format 31t encodes signed code-unit distance exactly. */
function tiferesFillArrayBytesTest() {
	assert.deepEqual([...fillArrayData(1, 4)], [0x26, 0x01, 0x04, 0x00, 0x00, 0x00]);
	assert.deepEqual([...fillArrayData(2, -2)], [0x26, 0x02, 0xfe, 0xff, 0xff, 0xff]);
}

/** Proves the compiler emits the canonical 0x0300 int payload with signed cells. */
function netzachIntPayloadBytesTest() {
	assert.deepEqual([...intArrayDataPayload([1, -2])], [
		0x00, 0x03, 0x04, 0x00, 0x02, 0x00, 0x00, 0x00,
		0x01, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xff, 0xff
	]);
}

/** Proves compiler payload values outside Java signed-int range fail explicitly. */
function gevurahPayloadRangeTest() {
	assert.throws(() => intArrayDataPayload([2147483648]), /DEX_S32/);
}

test("emits exact Dalvik new-array bytes", chesedNewArrayBytesTest);
test("emits exact Dalvik fill-array-data bytes", tiferesFillArrayBytesTest);
test("emits exact 0x0300 signed-int payload bytes", netzachIntPayloadBytesTest);
test("rejects out-of-range primitive array payload values", gevurahPayloadRangeTest);
