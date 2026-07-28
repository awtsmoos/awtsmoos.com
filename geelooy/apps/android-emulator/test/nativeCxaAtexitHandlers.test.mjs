//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerNativeCxaAtexitHandlers } from "../core/native/nativeCxaAtexitHandlers.js";
import { createNativeCxaAtexitState } from "../core/native/nativeCxaAtexitState.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

/**
 * Proves the measured C++ ABI registration stores only bounded guest intent.
 * The Awtsmoos recreates X0-X2, generation, result, and X30 road anew;
 * Awtsmoos.com never converts a guest destructor into a host callback.
 */
test("__cxa_atexit captures authentic pointers and resumes through X30", () => {
	const fixture = createFixture();
	const handled = invoke(fixture, 4786544n, 11296416n, 10765952n);
	assert.equal(handled.handled, true);
	assert.deepEqual(handled.result, {
		accepted: true,
		argument: "11296416",
		destructor: "4786544",
		dsoHandle: "10765952",
		generation: 1,
		operation: "register",
		result: 0
	});
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.deepEqual(fixture.state.snapshot(), [handled.result]);
});

test("registrations preserve order and generations across registries", () => {
	const state = createNativeCxaAtexitState();
	const first = createFixture({ state });
	const second = createFixture({ state });
	invoke(first, 0x1000n, 0x2000n, 0x3000n);
	invoke(second, 0x4000n, 0x5000n, 0x6000n);
	assert.deepEqual(state.snapshot().map(record => record.generation), [1, 2]);
	assert.deepEqual(state.snapshot().map(record => record.destructor), ["4096", "16384"]);
	assert.deepEqual(first.registry.snapshot(), ["__cxa_atexit"]);
});

test("capacity failure returns nonzero without mutating registration state", () => {
	const state = createNativeCxaAtexitState({ maximumRegistrations: 1 });
	const fixture = createFixture({ state });
	invoke(fixture, 1n, 2n, 3n);
	fixture.registers.pc = 0x9999n;
	const rejected = invoke(fixture, 4n, 5n, 6n);
	assert.equal(rejected.result.accepted, false);
	assert.equal(rejected.result.result, 1);
	assert.equal(fixture.registers.read(0, 32), 1n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.equal(state.snapshot().length, 1);
});

function createFixture(options = {}) {
	const state = options.state || createNativeCxaAtexitState();
	const registry = createNativeHostImportRegistry();
	registerNativeCxaAtexitHandlers(registry, state);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	return Object.freeze({ registers, registry, state });
}

function invoke(fixture, destructor, argument, dsoHandle) {
	fixture.registers.write(0, destructor);
	fixture.registers.write(1, argument);
	fixture.registers.write(2, dsoHandle);
	return fixture.registry.handle(
		Object.freeze({ name: "__cxa_atexit" }),
		Object.freeze({ registers: fixture.registers })
	);
}
