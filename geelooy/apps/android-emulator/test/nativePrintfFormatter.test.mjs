//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createNativeAarch64VaList } from "../core/native/nativeAarch64VaList.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { formatNativePrintf } from "../core/native/nativePrintfFormatter.js";

test("strings, integers, pointers, width, and literal percent remain exact", () => {
	const fixture = createFixture([0x5800n, 0xffffffffn, 0x2an, 0x1234n, 0x41n]);
	writeCString(fixture.memory, 0x5800n, "abcdef");
	assert.equal(formatNativePrintf({ arguments: fixture.arguments, format: "%.3s %+06d %#06x %p %-3c %%", memory: fixture.memory }), "abc -00001 0x002a 0x1234 A   %");
});

test("dynamic precision consumes GP precision before string and integer values", () => {
	const fixture = createFixture([3n, 0x5800n, 4n, 12n]);
	writeCString(fixture.memory, 0x5800n, "abcdef");
	assert.equal(formatNativePrintf({ arguments: fixture.arguments, format: "%.*s:%.*d", memory: fixture.memory }), "abc:0012");
});

test("promoted doubles render fixed, exponent, general, sign, and width", () => {
	const fixture = createFixture([], [12.5, 0.00125, 1200, -2.5]);
	assert.equal(formatNativePrintf({ arguments: fixture.arguments, format: "%.2f %.2e %.3g %+08.1f", memory: fixture.memory }), "12.50 1.25e-03 1.2e+03 -00002.5");
});

test("dynamic float precision is read from GP while value comes from vector save", () => {
	const fixture = createFixture([3n], [1.23456]);
	assert.equal(formatNativePrintf({ arguments: fixture.arguments, format: "%.*f", memory: fixture.memory }), "1.235");
});

test("negative dynamic precision behaves as omitted precision", () => {
	const fixture = createFixture([BigInt.asUintN(32, -1n), 0x5800n]);
	writeCString(fixture.memory, 0x5800n, "abcdef");
	assert.equal(formatNativePrintf({ arguments: fixture.arguments, format: "%.*s", memory: fixture.memory }), "abcdef");
});

test("dynamic width, write-back, and unimplemented hex-float remain rejected", () => {
	for (const format of ["%*d", "%n", "%a"]) {
		const fixture = createFixture([1n]);
		assert.throws(() => formatNativePrintf({ arguments: fixture.arguments, format, memory: fixture.memory }), /NATIVE_PRINTF/);
	}
});

function createFixture(generalValues, floatingValues = []) {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "printf");
	writeAarch64Integer(memory, 0x5100n, 0x5400n, 64);
	writeAarch64Integer(memory, 0x5108n, 0x5700n, 64);
	writeAarch64Integer(memory, 0x5110n, 0x5f00n, 64);
	writeAarch64Integer(memory, 0x5118n, BigInt.asUintN(32, BigInt(-8 * generalValues.length)), 32);
	writeAarch64Integer(memory, 0x511cn, BigInt.asUintN(32, BigInt(-16 * floatingValues.length)), 32);
	generalValues.forEach((value, index) => writeAarch64Integer(memory, 0x5700n - BigInt(8 * generalValues.length) + BigInt(index * 8), value, 64));
	floatingValues.forEach((value, index) => writeFloat64(memory, 0x5f00n - BigInt(16 * floatingValues.length) + BigInt(index * 16), value));
	return { arguments: createNativeAarch64VaList(memory, 0x5100n), memory };
}

function writeCString(memory, address, value) {
	memory.write(address, new TextEncoder().encode(`${value}\0`));
}

function writeFloat64(memory, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setFloat64(0, value, true);
	memory.write(address, bytes);
}
