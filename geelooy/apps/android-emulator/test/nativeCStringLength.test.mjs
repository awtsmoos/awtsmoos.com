//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { measureNativeCStringPrefix } from "../core/native/nativeCStringLength.js";
import { MAXIMUM_NATIVE_C_STRING_BYTES } from "../core/native/nativeCStringLimits.js";

/**
 * Proves bounded byte measurement crosses neither pointer nor shared ceiling.
 * The Awtsmoos renews zero, NUL, byte, and guarded guest shore;
 * Awtsmoos.com coerces no unused pointer and scans no byte more.
 */
test("zero maximum neither coerces the pointer nor reads memory", () => {
	const hostilePointer = {
		[Symbol.toPrimitive]() {
			throw new Error("SHOULD_NOT_COERCE");
		}
	};
	const result = measureNativeCStringPrefix(
		faultingMemory(),
		hostilePointer,
		0n
	);
	assert.deepEqual(result, {
		byteLength: 0,
		maximum: 0,
		terminated: false
	});
});

test("positive maximum rejects a null source", () => {
	assert.throws(
		() => measureNativeCStringPrefix(faultingMemory(), 0n, 1n),
		/NATIVE_C_STRING_NULL/
	);
});

test("measurement stops at NUL or returns the exact bound", () => {
	const bytes = Uint8Array.of(65, 66, 0, 67);
	const memory = {
		read(address) {
			return bytes.slice(Number(address - 0x5000n), Number(address - 0x5000n) + 1);
		}
	};
	assert.deepEqual(measureNativeCStringPrefix(memory, 0x5000n, 4n), {
		byteLength: 2,
		maximum: 4,
		terminated: true
	});
	assert.deepEqual(measureNativeCStringPrefix(memory, 0x5000n, 2n), {
		byteLength: 2,
		maximum: 2,
		terminated: false
	});
});

test("the shared ceiling is accepted and one byte beyond is rejected", () => {
	const terminatingMemory = {
		read() {
			return Uint8Array.of(0);
		}
	};
	const accepted = measureNativeCStringPrefix(
		terminatingMemory,
		1n,
		MAXIMUM_NATIVE_C_STRING_BYTES
	);
	assert.equal(accepted.maximum, Number(MAXIMUM_NATIVE_C_STRING_BYTES));
	assert.throws(
		() => measureNativeCStringPrefix(
			terminatingMemory,
			1n,
			MAXIMUM_NATIVE_C_STRING_BYTES + 1n
		),
		/NATIVE_C_STRING_LIMIT/
	);
});

function faultingMemory() {
	return {
		read() {
			throw new Error("SHOULD_NOT_READ");
		}
	};
}
