//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeGlesUniformHandlers } from "../core/native/registerNativeGlesUniformHandlers.js";

const RETURN = 0x7777n;

/** Proves location lookup and scalar FP ABI retain guest values and return through X30. */
test("uniform location and glUniform4f use exact guest ABI classes", () => {
	const fixture = createFixture();
	writeCString(fixture.memory, 0x5100n, "uTint");
	fixture.registers.write(0, 7n);
	fixture.registers.write(1, 0x5100n);
	invoke(fixture, "glGetUniformLocation");
	assert.equal(fixture.registers.read(0, 32), 12n);
	fixture.registers.write(0, 12n);
	[1, 0.5, 0.25, 1].forEach((value, index) => fixture.registers.writeFloat(index, value, 32));
	invoke(fixture, "glUniform4f");
	assert.equal(fixture.calls.at(-1).method, "uniform4f");
	assert.deepEqual(fixture.calls.at(-1).values, [1, 0.5, 0.25, 1]);
	assert.equal(fixture.registers.pc, RETURN);
});

/** Proves matrix handlers read exact little-endian guest floats and reject transpose. */
test("matrix uniforms read guest arrays and preserve WebGL method spelling", () => {
	const fixture = createFixture();
	writeFloats(fixture.memory, 0x5200n, Array.from({ length: 16 }, (_, index) => index + 0.5));
	fixture.registers.write(0, 12n);
	fixture.registers.write(1, 1n);
	fixture.registers.write(2, 0n);
	fixture.registers.write(3, 0x5200n);
	invoke(fixture, "glUniformMatrix4fv");
	assert.equal(fixture.calls.at(-1).method, "uniformMatrix4fv");
	assert.equal(fixture.calls.at(-1).values.length, 16);
});

/** Creates a narrow uniform-state spy while exercising the real host-import registry and ABI. */
function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x2000, "uniform-test");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: 1n });
	const registry = createNativeHostImportRegistry();
	const calls = [];
	const state = {
		domain: { invalidValue: () => calls.push({ error: "invalidValue" }) },
		location: () => 12,
		set: (location, method, values, options) => { calls.push({ location, method, options, values: [...values] }); return true; }
	};
	registerNativeGlesUniformHandlers(registry, state);
	return { calls, memory, registers, registry, systemRegisters };
}

/** Invokes one GLES import and reinstalls LR because each handler consumes X30. */
function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN);
	return fixture.registry.handle({ name }, fixture);
}

/** Writes one NUL-terminated UTF-8 string through guest memory rather than host shortcuts. */
function writeCString(memory, address, text) {
	memory.write(address, new TextEncoder().encode(`${text}\0`));
}

/** Writes float32 lanes exactly as GLES pointer-based matrix uploads observe them. */
function writeFloats(memory, address, values) {
	const bytes = new Uint8Array(values.length * 4);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => view.setFloat32(index * 4, value, true));
	memory.write(address, bytes);
}
