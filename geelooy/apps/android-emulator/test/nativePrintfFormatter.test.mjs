//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createNativeAarch64VaList } from "../core/native/nativeAarch64VaList.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { formatNativePrintf } from "../core/native/nativePrintfFormatter.js";

/**
 * Proves guest printf rendering remains bounded, bit-exact, and host-independent.
 * The Awtsmoos recreates string, integer, pointer, flags, and precision anew;
 * Awtsmoos.com rejects floating and write-back conversions explicitly.
 */
test("authentic Skia string format reveals the missing Android font path", () => {
	const fixture = createFixture([0x5800n]);
	writeCString(fixture.memory, 0x5800n, "/system/etc/fonts.xml");
	assert.equal(
		formatNativePrintf({
			arguments: fixture.arguments,
			format: "[SkFontMgr Android Parser] '%s' could not be opened\n",
			memory: fixture.memory
		}),
		"[SkFontMgr Android Parser] '/system/etc/fonts.xml' could not be opened\n"
	);
});

test("integer, pointer, width, precision, and literal percent remain exact", () => {
	const fixture = createFixture([
		0xffffffffn,
		0x2an,
		0x1234n,
		0x41n
	]);
	assert.equal(
		formatNativePrintf({
			arguments: fixture.arguments,
			format: "%+06d %#06x %p %-3c %%",
			memory: fixture.memory
		}),
		"-00001 0x002a 0x1234 A   %"
	);
});

test("string precision and null pointers are deterministic", () => {
	const fixture = createFixture([0x5800n, 0n]);
	writeCString(fixture.memory, 0x5800n, "abcdef");
	assert.equal(
		formatNativePrintf({
			arguments: fixture.arguments,
			format: "%.3s:%8s",
			memory: fixture.memory
		}),
		"abc:  (null)"
	);
});

test("floating, dynamic width, and write-back conversions are rejected", () => {
	for (const format of ["%f", "%*d", "%n"]) {
		const fixture = createFixture([1n]);
		assert.throws(
			() => formatNativePrintf({ arguments: fixture.arguments, format, memory: fixture.memory }),
			/NATIVE_PRINTF/
		);
	}
});

function createFixture(values) {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "printf");
	writeAarch64Integer(memory, 0x5100n, 0x5600n, 64);
	writeAarch64Integer(memory, 0x5108n, 0x5700n, 64);
	writeAarch64Integer(memory, 0x5110n, 0n, 64);
	writeAarch64Integer(memory, 0x5118n, BigInt.asUintN(32, BigInt(-8 * values.length)), 32);
	writeAarch64Integer(memory, 0x511cn, 0n, 32);
	values.forEach((value, index) => {
		writeAarch64Integer(memory, 0x5700n - BigInt(8 * values.length) + BigInt(index * 8), value, 64);
	});
	return { arguments: createNativeAarch64VaList(memory, 0x5100n), memory };
}

function writeCString(memory, address, value) {
	memory.write(address, new TextEncoder().encode(`${value}\0`));
}
