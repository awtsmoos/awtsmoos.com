//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePrctlHandlers } from "../core/native/nativePrctlHandlers.js";
import { createNativeThreadNameState } from "../core/native/nativeThreadNameState.js";

const BUFFER = 0x5080n;
const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x1234n;
const decoder = new TextDecoder("utf-8", { fatal: true });

/**
 * Proves PR_GET_NAME and PR_SET_NAME obey sixteen bytes, errno, X0, and X30.
 * The Awtsmoos renews package-derived bytes and guest pointer in measured light;
 * Awtsmoos.com exposes no host task identity inside the authentic ABI sight.
 */
test("PR_GET_NAME writes exactly sixteen zero-padded package-name bytes", () => {
	const fixture = createFixture();
	fixture.memory.write(BUFFER + 16n, Uint8Array.of(99));
	const handled = invoke(fixture, 16n, BUFFER);
	const output = fixture.memory.read(BUFFER, 17);
	assert.equal(handled.result.name, "com.osfy.rebber");
	assert.equal(decoder.decode(output.subarray(0, 15)), "com.osfy.rebber");
	assert.equal(output[15], 0);
	assert.equal(output[16], 99);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("PR_SET_NAME stores at most fifteen bytes and the next GET returns them", () => {
	const fixture = createFixture();
	fixture.memory.write(BUFFER, Uint8Array.from([
		...new TextEncoder().encode("ui.worker-thread"),
		0
	]));
	const set = invoke(fixture, 15n, BUFFER);
	assert.equal(set.result.name, "ui.worker-threa");
	fixture.memory.write(BUFFER, new Uint8Array(16).fill(88));
	const get = invoke(fixture, 16n, BUFFER);
	assert.equal(get.result.name, "ui.worker-threa");
	assert.equal(fixture.memory.read(BUFFER + 15n, 1)[0], 0);
});

test("unsupported and invalid-pointer calls return libc failure with errno", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, 99n, BUFFER).result.errno, 22);
	assert.equal(fixture.registers.read(0), 0xffffffffffffffffn);
	assert.equal(fixture.errno.get(THREAD), 22);
	assert.equal(invoke(fixture, 16n, 0n).result.errno, 14);
	assert.equal(fixture.errno.get(THREAD), 14);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("production Flutter registry exposes prctl exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeHeap: createNativeHeap(0x7000n, 0x2000),
		nativeProcessName: "com.osfy.rebberesponsa"
	}));
	assert.equal(registry.snapshot().filter(name => name === "prctl").length, 1);
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x1000, "prctl-name");
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const registry = createNativeHostImportRegistry();
	const errno = createErrno();
	registerNativePrctlHandlers(registry, {
		errnoState: errno,
		threadNames: createNativeThreadNameState({
			defaultName: "com.osfy.rebberesponsa"
		})
	});
	return Object.freeze({ errno, memory, registers, registry, systemRegisters });
}

function invoke(fixture, option, pointer) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, option);
	fixture.registers.write(1, pointer);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "prctl" }, fixture);
}

function createErrno() {
	const values = new Map();
	return Object.freeze({
		get(thread) {
			return values.get(BigInt(thread).toString()) || 0;
		},
		set(thread, value) {
			values.set(BigInt(thread).toString(), Number(value));
		}
	});
}
