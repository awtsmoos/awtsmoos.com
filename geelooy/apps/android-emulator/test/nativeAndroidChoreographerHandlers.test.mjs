//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { registerNativeAndroidChoreographerHandlers } from "../core/native/nativeAndroidChoreographerHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;
const CALLBACK = 0x1100n;

/**
 * Proves Choreographer delivers frame arguments through authentic guest AArch64 execution.
 * The Awtsmoos renews X0, X1, BL, import, and RET in one executable light;
 * Awtsmoos.com lets guest instructions carry the frame while host invention leaves sight.
 */
test("Choreographer post executes a real AArch64 frame callback after posting returns", () => {
	const fixture = createFixture();
	writeWords(fixture.memory, CALLBACK, [
		0xaa1e03f3,
		bl(CALLBACK + 4n, 0x2000n),
		0xaa1303fe,
		0xd65f03c0
	]);
	const ordering = [];
	fixture.registry.register("capture_frame", context => {
		ordering.push("guest-callback");
		fixture.captured.push({
			data: context.registers.read(1),
			frameTimeNanos: context.registers.read(0)
		});
		context.registers.pc = context.registers.read(30, 64, "zero");
		return Object.freeze({ operation: "capture_frame" });
	});
	const instance = invoke(fixture, "AChoreographer_getInstance");
	const handle = fixture.registers.read(0);
	assert.equal(instance.result.handle, handle.toString());
	fixture.registers.write(0, handle);
	fixture.registers.write(1, CALLBACK);
	fixture.registers.write(2, 0xabcden);
	ordering.push("before-post");
	const posted = invoke(fixture, "AChoreographer_postFrameCallback64");
	ordering.push("after-post");
	assert.equal(posted.result.kind, "int64");
	assert.deepEqual(ordering, ["before-post", "guest-callback", "after-post"]);
	assert.equal(fixture.captured.length, 1);
	assert.equal(fixture.captured[0].data, 0xabcden);
	assert.equal(fixture.captured[0].frameTimeNanos, 16666667n);
	assert.equal(fixture.state.snapshot().pending, 0);
	assert.equal(fixture.state.snapshot().draining, false);
});

function createFixture() {
	const region = createNativeAnonymousMemory(0x1000n, 0x4000, "choreographer");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("capture_frame");
	const registry = createNativeHostImportRegistry();
	const machineState = { imports };
	const state = registerNativeAndroidChoreographerHandlers(registry, machineState);
	return {
		captured: [],
		imports,
		memory,
		registers: createAarch64Registers({ programCounter: 0x9000n, stackPointer: 0x4ff0n }),
		registry,
		state,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	};
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	const handled = fixture.registry.handle({ name }, fixture);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	return handled;
}

function writeWords(memory, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	memory.write(address, bytes);
}

function bl(from, to) {
	return (0x94000000 | Number((to - from) / 4n)) >>> 0;
}

function faultingPrimary() {
	return {
		read(address, size) { throw new Error(`PRIMARY_READ:${address}:${size}`); },
		write(address, bytes) { throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`); }
	};
}
