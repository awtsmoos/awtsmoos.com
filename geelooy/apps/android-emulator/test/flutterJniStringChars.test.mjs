//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniStringHandlers } from "../core/native/flutterJniStringHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { jniNativeInterfaceSlotName } from "../core/native/jniNativeInterfaceNames.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const ENVIRONMENT = 0x4000n;
const RETURN_ADDRESS = 0x7777n;

test("GetStringChars copies authentic UTF-16 and releases it", () => {
	const fixture = createFixture("flutter");
	const copyFlag = fixture.heap.allocate(1n);
	const acquired = invoke(fixture, "GetStringChars", [
		fixture.handle,
		copyFlag
	]);
	const pointer = BigInt(acquired.result.pointer);
	assert.deepEqual([...fixture.heap.read(pointer, 14)], [
		102, 0, 108, 0, 117, 0, 116, 0,
		116, 0, 101, 0, 114, 0
	]);
	assert.equal(fixture.heap.read(copyFlag, 1)[0], 1);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	invoke(fixture, "ReleaseStringChars", [fixture.handle, pointer]);
	assert.throws(
		() => invoke(fixture, "ReleaseStringChars", [fixture.handle, pointer]),
		error => error.code === "JNI_STRING_CHARS_POINTER"
	);
	assert.equal(jniNativeInterfaceSlotName(165), "GetStringChars");
	assert.equal(jniNativeInterfaceSlotName(166), "ReleaseStringChars");
});

test("GetStringLength counts UTF-16 code units", () => {
	const fixture = createFixture("A😀B");
	invoke(fixture, "GetStringLength", [fixture.handle]);
	assert.equal(fixture.registers.read(0, 32, "zero"), 4n);
	assert.equal(jniNativeInterfaceSlotName(164), "GetStringLength");
});

test("string copies support empty values and reject foreign pointers", () => {
	const fixture = createFixture("");
	const acquired = invoke(fixture, "GetStringChars", [fixture.handle, 0n]);
	const pointer = BigInt(acquired.result.pointer);
	assert.notEqual(pointer, 0n);
	assert.throws(
		() => invoke(fixture, "ReleaseStringChars", [fixture.handle, pointer + 16n]),
		error => error.code === "JNI_STRING_CHARS_POINTER"
	);
	invoke(fixture, "ReleaseStringChars", [fixture.handle, pointer]);
});

function createFixture(value) {
	const heap = createNativeHeap(0x10000n, 0x2000);
	const references = createJniGuestReferences();
	const handle = references.create("string", `string:${value}`, value);
	const registers = createAarch64Registers();
	const registry = createNativeHostImportRegistry();
	registerFlutterJniStringHandlers(registry, {
		jniEnvironment: Object.freeze({
			environmentAddress: ENVIRONMENT.toString()
		}),
		jniReferences: references,
		nativeHeap: heap,
		resolveStringValue(target) {
			return target;
		}
	});
	return { handle, heap, registers, registry };
}

function invoke(fixture, name, argumentsList) {
	fixture.registers.write(0, ENVIRONMENT, 64, "zero");
	argumentsList.forEach((value, index) => {
		fixture.registers.write(index + 1, BigInt(value), 64, "zero");
	});
	fixture.registers.write(30, RETURN_ADDRESS, 64, "zero");
	return fixture.registry.handle(
		Object.freeze({ name: `JNINativeInterface.${name}` }),
		Object.freeze({ memory: fixture.heap, registers: fixture.registers })
	);
}
