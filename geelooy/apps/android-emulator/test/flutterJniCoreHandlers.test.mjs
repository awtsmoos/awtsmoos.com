//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniCoreHandlers } from "../core/native/flutterJniCoreHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const ENVIRONMENT = 0x5100n;
const JAVA_VM = 0x5200n;
const DESTINATION = 0x5300n;
const RETURN = 0x7777n;

/**
 * Creates one isolated standard-JNI core fixture with real guest memory and refs.
 */
function createFixture() {
	const registers = createAarch64Registers();
	const references = createJniGuestReferences();
	const rawMemory = createNativeAnonymousMemory(0x5000n, 0x1000, "jni-core-test");
	const memory = createNativeCompositeMemory(rawMemory, [], "jni-core-test");
	const registry = createNativeHostImportRegistry();
	registerFlutterJniCoreHandlers(registry, {
		javaVmAddress: JAVA_VM,
		jniEnvironment: { environmentAddress: ENVIRONMENT.toString() },
		jniReferences: references,
		memory
	});
	return { memory, references, registers, registry };
}
function invoke(fixture, name, args) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN);
	args.forEach((value, index) => fixture.registers.write(index, value));
	const handled = fixture.registry.handle(
		Object.freeze({ name }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(handled.handled, true);
	return handled.result;
}

test("GetVersion and GetJavaVM expose the persistent standard VM", () => {
	const fixture = createFixture();
	const version = invoke(
		fixture,
		"JNINativeInterface.GetVersion",
		[ENVIRONMENT]
	);
	assert.equal(version.version, 0x00010006);
	assert.equal(fixture.registers.read(0, 32), 0x00010006n);
	assert.equal(fixture.registers.pc, RETURN);
	const vm = invoke(
		fixture,
		"JNINativeInterface.GetJavaVM",
		[ENVIRONMENT, DESTINATION]
	);
	assert.equal(vm.javaVmAddress, JAVA_VM.toString());
	assert.equal(fixture.memory.readU64(DESTINATION), JAVA_VM);
	assert.equal(fixture.registers.read(0, 32), 0n);
});
test("GetObjectRefType distinguishes local global weak and invalid handles", () => {
	const fixture = createFixture();
	const target = Object.freeze({ value: 1 });
	const local = fixture.references.create(
		"object",
		"local-object",
		target,
		{ scope: "local" }
	);
	const global = fixture.references.create(
		"object",
		"global-object",
		target,
		{ scope: "global" }
	);
	const weak = fixture.references.create(
		"object",
		"weak-object",
		target,
		{ scope: "weak-global" }
	);
	for (const [handle, expected] of [
		[local, 1n],
		[global, 2n],
		[weak, 3n],
		[0n, 0n],
		[0x1234n, 0n]
	]) {
		invoke(fixture, "JNINativeInterface.GetObjectRefType", [ENVIRONMENT, handle]);
		assert.equal(fixture.registers.read(0, 32), expected);
	}
});
test("FatalError is a coded non-returning JNI boundary", () => {
	const fixture = createFixture();
	assert.throws(
		() => invoke(
			fixture,
			"JNINativeInterface.FatalError",
			[ENVIRONMENT, 0x5400n]
		),
		error => {
			assert.equal(error.code, "JNI_FATAL_ERROR");
			assert.match(error.message, /21504/);
			return true;
		}
	);
	assert.equal(fixture.registers.pc, 0x9000n);
});
