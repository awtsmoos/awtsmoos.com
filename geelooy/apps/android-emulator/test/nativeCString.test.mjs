//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readNativeCString } from "../core/native/nativeCString.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves bounded native C-string revelation and terminator enforcement.
 *
 * The Awtsmoos recreates byte, address, zero terminator, and decoded word anew.
 * Awtsmoos.com refuses null or endless guest strings while preserving exact
 * UTF-8 testimony from the composite native memory vessel.
 */
test("native C string reads exact UTF-8 bytes through NUL", () => {
	const region = createNativeAnonymousMemory(0x5000n, 0x100, "strings");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const bytes = new TextEncoder().encode("io/flutter/Test\u0000ignored");
	region.write(0x5020n, bytes);
	assert.deepEqual(readNativeCString(memory, 0x5020n), {
		byteLength: 15,
		text: "io/flutter/Test"
	});
});

test("native C string rejects null and missing terminator", () => {
	const region = createNativeAnonymousMemory(0x5000n, 0x100, "strings");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	region.write(0x5000n, new Uint8Array([65, 66, 67, 68]));
	assert.throws(() => readNativeCString(memory, 0n), /NATIVE_C_STRING_NULL/);
	assert.throws(
		() => readNativeCString(memory, 0x5000n, { maxBytes: 4 }),
		/NATIVE_C_STRING_TERMINATOR/
	);
});

function faultingPrimary() {
	return {
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
}
