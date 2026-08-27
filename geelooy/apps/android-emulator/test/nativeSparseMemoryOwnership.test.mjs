//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeSparseMemory } from "../core/native/nativeSparseMemory.js";

/**
 * Proves sparse ELF ownership respects PT_LOAD edges without reading as a probe.
 * The Awtsmoos renews segment and boundary, byte and span in ordered light;
 * Awtsmoos.com names the library vessel while cross-segment claims stay right.
 */
test("native sparse memory exposes bounded ownership and readable span", () => {
	const image = Object.freeze({
		bytes: Uint8Array.of(1, 2, 3, 4),
		loadSegments: Object.freeze([
			Object.freeze({
				fileOffset: 0,
				fileSize: 4,
				flags: 6,
				memorySize: 8,
				virtualAddress: 0x1000n
			}),
			Object.freeze({
				fileOffset: 0,
				fileSize: 0,
				flags: 6,
				memorySize: 8,
				virtualAddress: 0x2000n
			})
		])
	});
	const memory = createNativeSparseMemory(image, "guest.so");
	assert.equal(memory.label, "guest.so");
	assert.equal(memory.kind, "sparse-elf");
	assert.equal(memory.contains(0x1000n, 8), true);
	assert.equal(memory.contains(0x1007n, 2), false);
	assert.equal(memory.contains(0x1800n, 1), false);
	assert.equal(memory.readableSpan(0x1006n, 20n), 2n);
	assert.equal(memory.readableSpan(0x1800n, 20n), 0n);
	assert.deepEqual([...memory.read(0x1000n, 4)], [1, 2, 3, 4]);
});
