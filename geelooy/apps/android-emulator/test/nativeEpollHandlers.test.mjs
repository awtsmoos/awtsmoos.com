//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeDescriptorFlagState } from "../core/native/nativeDescriptorFlagState.js";
import { createNativeEpollState } from "../core/native/nativeEpollState.js";
import { readNativeEpollEvent, writeNativeEpollEvent } from "../core/native/nativeEpollEvent.js";
import { registerNativeEpollHandlers } from "../core/native/nativeEpollHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const RETURN_ADDRESS = 0x7777n;

test("epoll handlers reproduce create, ctl, and ready wait ABI", () => {
	const memory = createNativeAnonymousMemory(0x1000n, 0x2000, "epoll");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	const state = createNativeEpollState();
	registerNativeEpollHandlers(registry, {
		descriptorEvents: descriptor => descriptor === 50 ? 1 : 0,
		descriptorFlags: createNativeDescriptorFlagState(),
		state
	});
	registers.write(0, 64n);
	assert.equal(invoke(registry, registers, memory, "epoll_create").result.result, 0x40020000);
	writeNativeEpollEvent(memory, 0x1100n, { events: 1, data: 0xabcdefn });
	registers.write(0, 0x40020000n);
	registers.write(1, 1n);
	registers.write(2, 50n);
	registers.write(3, 0x1100n);
	assert.equal(invoke(registry, registers, memory, "epoll_ctl").result.result, 0);
	registers.write(0, 0x40020000n);
	registers.write(1, 0x1200n);
	registers.write(2, 4n);
	registers.write(3, 0n);
	assert.equal(invoke(registry, registers, memory, "epoll_wait").result.result, 1);
	assert.deepEqual(readNativeEpollEvent(memory, 0x1200n), { events: 1, data: 0xabcdefn });
});

function invoke(registry, registers, memory, name) {
	registers.pc = 0x9000n;
	registers.write(30, RETURN_ADDRESS);
	return registry.handle({ name }, { memory, registers });
}
