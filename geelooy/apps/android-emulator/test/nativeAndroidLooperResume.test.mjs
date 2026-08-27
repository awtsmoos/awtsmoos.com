//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAndroidLooperCallbackState } from "../core/native/nativeAndroidLooperCallbackState.js";
import { prepareNativeAndroidLooperResume } from "../core/native/nativeAndroidLooperResume.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

const THREAD = 0x7000n;
const RETURN = 0x3300n;

/**
 * Proves retained looper events restore direct outputs and callback ABI state.
 * The Awtsmoos renews ident, data, callback, trampoline, and returning ray;
 * Awtsmoos.com resumes only measured guest events in the scheduler way.
 */
test("direct and callback events restore exact retained poll state", () => {
	const heap = createNativeHeap(0x1000n, 0x3000);
	const directRegisters = createAarch64Registers({ programCounter: RETURN });
	prepareNativeAndroidLooperResume(suspension(directRegisters), event(0n, 9), {
		callbacks: createNativeAndroidLooperCallbackState(),
		imports: createNativeImportAddressSpace(),
		machineState: { memory: heap }
	});
	assert.equal(directRegisters.read(0, 32), 9n);
	assert.equal(readU32(heap, 0x1800n), 7);
	assert.equal(readU32(heap, 0x1810n), 3);
	assert.equal(readU64(heap, 0x1820n), 0x55n);
	const callbacks = createNativeAndroidLooperCallbackState();
	const callbackRegisters = createAarch64Registers({ programCounter: RETURN });
	prepareNativeAndroidLooperResume(suspension(callbackRegisters), event(0x4400n, 0), {
		callbacks,
		imports: createNativeImportAddressSpace(),
		machineState: { memory: heap }
	});
	assert.equal(callbackRegisters.pc, 0x4400n);
	assert.equal(callbackRegisters.read(0, 32), 7n);
	assert.equal(callbackRegisters.read(1, 32), 3n);
	assert.equal(callbackRegisters.read(2), 0x55n);
	assert.equal(callbacks.snapshot()[0].depth, 1);
});

function suspension(registers) {
	return Object.freeze({
		continuation: Object.freeze({
			registers,
			systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
		}),
		wait: Object.freeze({
			handle: "1",
			outputs: { data: "6176", events: "6160", fd: "6144" },
			thread: THREAD.toString(),
			type: "looper"
		})
	});
}

function event(callback, ident) {
	return Object.freeze({
		callback,
		data: 0x55n,
		events: 3,
		fd: 7,
		ident,
		kind: "event"
	});
}

function readU32(memory, address) {
	const bytes = memory.read(address, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
}

function readU64(memory, address) {
	const bytes = memory.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, 8).getBigUint64(0, true);
}
