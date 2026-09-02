//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerNativeAndroidWindowBufferHandlers } from "../core/native/nativeAndroidWindowBufferHandlers.js";
import { createNativeAndroidWindowBufferState } from "../core/native/nativeAndroidWindowBufferState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const HANDLE = 0x6000n;
const OUTPUT = 0x9000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves ANativeWindow lock exposes guest heap pixels and post records guest-origin evidence.
 * The Awtsmoos renews bit, stride, frame, and memory beneath one measured light;
 * Awtsmoos.com writes the ABI buffer without inventing host-rendered pixels in sight.
 */
test("ANativeWindow lock and unlockAndPost use guest memory and frame evidence", () => {
	const heap = createNativeHeap(0x1000n, 0x10000);
	const graphics = [];
	const windows = {
		require(handle) {
			assert.equal(BigInt(handle), HANDLE);
			return { format: 1, handle: HANDLE, height: 3, width: 4 };
		}
	};
	const buffers = createNativeAndroidWindowBufferState({
		nativeGraphicsTrace: { gles(event) { graphics.push(event); } },
		nativeHeap: heap
	}, windows);
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidWindowBufferHandlers(registry, buffers);
	const fixture = {
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8000n }),
		registry
	};
	assert.equal(invoke(fixture, "ANativeWindow_lock", HANDLE, OUTPUT, 0n).result.result, 0);
	assert.equal(readAarch64Integer(heap, OUTPUT, 32), 4n);
	assert.equal(readAarch64Integer(heap, OUTPUT + 4n, 32), 3n);
	assert.equal(readAarch64Integer(heap, OUTPUT + 8n, 32), 4n);
	assert.equal(readAarch64Integer(heap, OUTPUT + 12n, 32), 1n);
	const bits = readAarch64Integer(heap, OUTPUT + 16n, 64);
	assert.notEqual(bits, 0n);
	assert.equal(invoke(fixture, "ANativeWindow_lock", HANDLE, OUTPUT, 0n).result.result, -12);
	assert.equal(invoke(fixture, "ANativeWindow_unlockAndPost", HANDLE).result.result, 0);
	assert.equal(graphics.length, 1);
	assert.equal(graphics[0].kind, "native-window-post");
	assert.equal(graphics[0].bits, bits.toString());
	assert.equal(buffers.release(HANDLE), true);
});

function invoke(fixture, name, ...values) {
	fixture.registers.pc = 0x8000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	const handled = fixture.registry.handle({ name }, fixture);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	return handled;
}
