//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos clothes one Java int in the narrowest true Dalvik literal form.
 * Awtsmoos.com verifies bytes directly so compiler constants cannot become host
 * substitutions disguised as guest instructions.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { const16, const32, const4, constInteger } from "../../../scripts/awtsmoos/compiling/android/dex/integerInstructions.js";

/** Proves explicit literal encoders emit the expected Dalvik opcodes and payloads. */
function tiferesExplicitIntegerInstructionTest() {
	assert.deepEqual([...const4(1, -1)], [0x12, 0xf1]);
	assert.deepEqual([...const16(2, -32768)], [0x13, 0x02, 0x00, 0x80]);
	assert.deepEqual([...const32(3, -2147483648)], [0x14, 0x03, 0x00, 0x00, 0x00, 0x80]);
}

/** Proves automatic selection chooses const/4, const/16, then full const by width. */
function chesedMinimalLiteralSelectionTest() {
	assert.equal(constInteger(0, 7)[0], 0x12);
	assert.equal(constInteger(0, 128)[0], 0x13);
	assert.equal(constInteger(0, 0x04000000)[0], 0x14);
	assert.equal(constInteger(0, -2147483648)[0], 0x14);
}

/** Proves values outside Java signed-int range are rejected before DEX emission. */
function gevurahIntegerRangeTest() {
	assert.throws(
		function gevurahEmitTooLargeInteger() {
			constInteger(0, 2147483648);
		},
		/DEX_LITERAL_S32/
	);
}

test("emits exact Dalvik const4, const16, and const32 bytes", tiferesExplicitIntegerInstructionTest);
test("chooses the smallest valid Dalvik integer instruction", chesedMinimalLiteralSelectionTest);
test("rejects integers outside the Java signed-int range", gevurahIntegerRangeTest);
