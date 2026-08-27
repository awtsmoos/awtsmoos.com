//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { handleFlutterJniFindClass } from "../core/native/flutterJniFindClass.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves DEX-backed FindClass success, stable handle identity, and failure.
 *
 * The Awtsmoos recreates class name, descriptor, definition, and native handle
 * anew. Awtsmoos.com returns only identities revealed by the supplied class
 * universe and resumes through the guest's own link register.
 */
test("FindClass returns one stable handle for a resolved descriptor", () => {
	const fixture = createFindClassFixture([
		"Lio/flutter/embedding/engine/FlutterJNI;"
	]);
	const first = invokeFindClass(fixture, "io/flutter/embedding/engine/FlutterJNI");
	const second = invokeFindClass(fixture, "io/flutter/embedding/engine/FlutterJNI");
	assert.equal(first.found, true);
	assert.equal(first.descriptor, "Lio/flutter/embedding/engine/FlutterJNI;");
	assert.equal(first.handle, second.handle);
	assert.equal(fixture.references.snapshot().length, 1);
	assert.equal(fixture.registers.pc, 0x7777n);
});

test("FindClass returns zero when the descriptor is absent", () => {
	const fixture = createFindClassFixture([]);
	const result = invokeFindClass(fixture, "missing/Example");
	assert.equal(result.found, false);
	assert.equal(result.handle, "0");
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.references.snapshot().length, 0);
});

function invokeFindClass(fixture, className) {
	fixture.region.write(
		0x6000n,
		new Uint8Array([...new TextEncoder().encode(className), 0])
	);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, 0x5000n);
	fixture.registers.write(1, 0x6000n);
	fixture.registers.write(30, 0x7777n);
	return handleFlutterJniFindClass(
		Object.freeze({
			memory: fixture.memory,
			registers: fixture.registers
		}),
		fixture.machineState
	);
}

function createFindClassFixture(descriptors) {
	const definitions = new Map(descriptors.map(descriptor => {
		return [descriptor, Object.freeze({ type: descriptor })];
	}));
	const region = createNativeAnonymousMemory(0x5000n, 0x2000, "jni-test");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const references = createJniGuestReferences();
	const machineState = Object.freeze({
		jniEnvironment: Object.freeze({ environmentAddress: "20480" }),
		jniReferences: references,
		resolveClass(descriptor) {
			return definitions.get(descriptor) || null;
		}
	});
	return Object.freeze({
		machineState,
		memory,
		references,
		region,
		registers: createAarch64Registers()
	});
}

function faultingPrimary() {
	return {
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
}
