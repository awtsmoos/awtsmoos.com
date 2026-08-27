//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeDescriptorFlagState } from "../core/native/nativeDescriptorFlagState.js";
import { createNativeEpollState } from "../core/native/nativeEpollState.js";
import { registerNativeFileOpenHandlers } from "../core/native/nativeFileOpenHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeLinuxClock } from "../core/native/nativeLinuxClock.js";
import { createNativePipeState } from "../core/native/nativePipeState.js";
import { createNativeReadOnlyDescriptorState } from "../core/native/nativeReadOnlyDescriptorState.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "../core/native/registerNativeTimerFdHandlers.js";

const PATH = 0x1100n;
const BUFFER = 0x1200n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves one descriptor survives checked open, fcntl, read, readiness, and close.
 * The Awtsmoos renews shared metadata and changing entropy across every gate;
 * Awtsmoos.com creates no parallel descriptor universe and no fabricated state.
 */
test("urandom descriptor completes the shared lifecycle", () => {
	const fixture = createFixture();
	fixture.memory.write(PATH, new TextEncoder().encode("/dev/urandom\0"));
	invoke(fixture, "__open_2", [PATH, 0x80000n]);
	const descriptor = Number(fixture.registers.read(0));
	assert.equal(descriptor, 0x40020000);
	assert.equal(fixture.events(descriptor), 1);
	const getFd = invoke(fixture, "fcntl", [BigInt(descriptor), 1n, 0n]);
	assert.equal(getFd.result.result, 1);
	const read = invoke(fixture, "read", [BigInt(descriptor), BUFFER, 32n]);
	assert.equal(read.result.kind, "entropy");
	assert.equal(fixture.registers.read(0), 32n);
	assert.ok(new Set(fixture.memory.read(BUFFER, 32)).size > 8);
	assert.equal(invoke(fixture, "close", [BigInt(descriptor)]).result.result, 0);
	assert.equal(fixture.flags.get(descriptor), null);
	assert.equal(fixture.state.has(descriptor), false);
	assert.equal(invoke(fixture, "read", [BigInt(descriptor), BUFFER, 1n]).result.errno, 9);
});

test("zero-count read neither requires nor mutates a buffer", () => {
	const fixture = createFixture();
	fixture.memory.write(PATH, new TextEncoder().encode("/dev/urandom\0"));
	invoke(fixture, "open", [PATH, 0n]);
	const descriptor = fixture.registers.read(0);
	const result = invoke(fixture, "read", [descriptor, 0n, 0n]);
	assert.equal(result.result.result, 0);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x1000n, 0x2000, "descriptor-flow");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const registry = createNativeHostImportRegistry();
	const flags = createNativeDescriptorFlagState();
	const state = createNativeReadOnlyDescriptorState({ descriptorFlags: flags, entropySeed: 3n });
	const clock = createNativeLinuxClock();
	const timers = createNativeTimerFdState({ clock });
	const pipes = createNativePipeState();
	const epollState = createNativeEpollState();
	const events = descriptor => timers.events(descriptor)
		| pipes.events(descriptor)
		| state.events(descriptor);
	registerNativeFileOpenHandlers(registry, { state });
	registerNativeTimerFdHandlers(registry, {
		clock,
		descriptorEvents: events,
		descriptorFlags: flags,
		epollState,
		pipeState: pipes,
		readOnlyState: state,
		state: timers
	});
	return Object.freeze({ events, flags, memory, registers, registry, state });
}

function invoke(fixture, name, values) {
	fixture.registers.pc = 0x9000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
