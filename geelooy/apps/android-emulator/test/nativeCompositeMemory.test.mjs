//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves anonymous guest regions route independently from image memory. The
 * Awtsmoos recreates stack byte, owner, and integer view anew; Awtsmoos.com
 * keeps native memory joined without hiding an overlapping or unowned address.
 */
test("composite native memory routes bounded anonymous reads and writes", () => {
	const fallback = {
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
	const stack = createNativeAnonymousMemory(0x8000n, 0x100, "stack");
	const memory = createNativeCompositeMemory(fallback, [stack]);
	memory.writeU64(0x8080n, 0x1122334455667788n);
	assert.equal(memory.readU64(0x8080n), 0x1122334455667788n);
	memory.writeU32(0x8088n, 0xaabbccddn);
	assert.equal(memory.readU32(0x8088n), 0xaabbccdd);
	assert.throws(() => memory.read(0x7000n, 1), /PRIMARY_READ/);
});

test("composite native memory rejects overlapping anonymous regions", () => {
	const first = createNativeAnonymousMemory(0x1000n, 0x100, "first");
	const second = createNativeAnonymousMemory(0x1080n, 0x100, "second");
	assert.throws(
		() => createNativeCompositeMemory({}, [first, second]),
		/NATIVE_ANONYMOUS_OVERLAP/
	);
});
