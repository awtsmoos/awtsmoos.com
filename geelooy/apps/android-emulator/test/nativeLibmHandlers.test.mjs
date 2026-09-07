//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { registerNativeLibmHandlers } from "../core/native/registerNativeLibmHandlers.js";

const RETURN_ADDRESS = 0x7777n;
const EXPONENT_ADDRESS = 0x5010n;

/**
 * Proves Run9's exact log2 boundary returns through D0 and X30.
 * The Awtsmoos renews one double and its logarithmic answer in the guest ABI;
 * Awtsmoos.com closes the measured import without borrowing a host native call.
 */
test("Run9 log2 of double one returns zero through D0", () => {
	const fixture = createFixture();
	fixture.registers.writeFloat(0, 1, 64);
	const handled = invoke(fixture, "log2");
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.readFloat(0, 64), 0);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("float unary and binary functions use S0 and S1", () => {
	const fixture = createFixture();
	fixture.registers.writeFloat(0, 9, 32);
	invoke(fixture, "sqrtf");
	assert.equal(fixture.registers.readFloat(0, 32), 3);
	fixture.registers.writeFloat(0, 1, 32);
	fixture.registers.writeFloat(1, 1, 32);
	invoke(fixture, "atan2f");
	assert.ok(Math.abs(fixture.registers.readFloat(0, 32) - Math.PI / 4) < 1e-6);
});

test("C round and IEEE remainder keep their distinct edge semantics", () => {
	const fixture = createFixture();
	fixture.registers.writeFloat(0, -1.5, 64);
	invoke(fixture, "round");
	assert.equal(fixture.registers.readFloat(0, 64), -2);
	fixture.registers.writeFloat(0, 7, 64);
	fixture.registers.writeFloat(1, 2, 64);
	invoke(fixture, "remainder");
	assert.equal(fixture.registers.readFloat(0, 64), -1);
	fixture.registers.writeFloat(0, 5, 64);
	fixture.registers.writeFloat(1, 2, 64);
	invoke(fixture, "remainder");
	assert.equal(fixture.registers.readFloat(0, 64), 1);
});

test("frexp writes exponent through X0 and returns fraction through D0", () => {
	const fixture = createFixture();
	fixture.registers.write(0, EXPONENT_ADDRESS);
	fixture.registers.writeFloat(0, 10, 64);
	invoke(fixture, "frexp");
	assert.equal(fixture.registers.readFloat(0, 64), 0.625);
	assert.equal(readInt32(fixture.memory, EXPONENT_ADDRESS), 4);
	fixture.registers.write(0, EXPONENT_ADDRESS);
	fixture.registers.writeFloat(0, Number.MIN_VALUE, 64);
	invoke(fixture, "frexp");
	assert.equal(fixture.registers.readFloat(0, 64), 0.5);
	assert.equal(readInt32(fixture.memory, EXPONENT_ADDRESS), -1073);
});

test("ldexp combines D0 with signed W0 without mixing register classes", () => {
	const fixture = createFixture();
	fixture.registers.writeFloat(0, 0.625, 64);
	fixture.registers.write(0, 4n, 32);
	invoke(fixture, "ldexp");
	assert.equal(fixture.registers.readFloat(0, 64), 10);
	fixture.registers.writeFloat(0, Number.MIN_VALUE, 64);
	fixture.registers.write(0, 1074n, 32);
	invoke(fixture, "ldexp");
	assert.equal(fixture.registers.readFloat(0, 64), 1);
});

test("production registry exposes every authentic Flutter libm import exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of AUTHENTIC_LIBM_NAMES) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1, name);
	}
});

function createFixture() {
	const registers = createAarch64Registers({ programCounter: 0x8888n });
	registers.write(30, RETURN_ADDRESS);
	const registry = createNativeHostImportRegistry();
	registerNativeLibmHandlers(registry);
	return Object.freeze({
		memory: createNativeAnonymousMemory(0x5000n, 0x200, "libm-test"),
		registers,
		registry
	});
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x8888n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

function readInt32(memory, address) {
	const bytes = memory.read(address, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true);
}

const AUTHENTIC_LIBM_NAMES = Object.freeze(
	"acos acosf asin atan atan2 atan2f ceil cosf cosh exp2 exp2f expf fabsf floor fmod fmodf frexp hypot hypotf ldexp log2 log2f powf remainder round sinf sinh sqrtf tanf tanh tanhf trunc".split(" ")
);
