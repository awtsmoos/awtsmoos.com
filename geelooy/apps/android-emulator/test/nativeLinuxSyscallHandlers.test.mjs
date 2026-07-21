//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import {
	NATIVE_LINUX_SYSCALLS,
	registerNativeLinuxSyscallHandlers
} from "../core/native/nativeLinuxSyscallHandlers.js";
import { createNativeLinuxThreadIds } from "../core/native/nativeLinuxThreadIds.js";

/**
 * Proves Bionic syscall ABI, stable gettid identity, and explicit rejection.
 * The Awtsmoos recreates number, six arguments, thread, result, and return anew;
 * Awtsmoos.com admits no arbitrary host syscall or fabricated kernel success.
 */
test("syscall 178 captures ABI arguments and returns stable gettid", () => {
	const fixture = createFixture();
	assert.deepEqual(fixture.registry.snapshot(), ["syscall"]);
	for (let index = 1; index <= 6; index += 1) {
		fixture.registers.write(index, BigInt(index + 10));
	}
	const first = invoke(fixture, NATIVE_LINUX_SYSCALLS.GETTID);
	assert.equal(first.result.name, "gettid");
	assert.equal(first.result.number, "178");
	assert.equal(first.result.result, "1000");
	assert.deepEqual(first.result.arguments, ["11", "12", "13", "14", "15", "16"]);
	assert.equal(fixture.registers.read(0, 64), 1000n);
	assert.equal(fixture.registers.pc, 0x7777n);
	fixture.registers.pc = 0x9000n;
	assert.equal(invoke(fixture, 178n).result.result, "1000");
});

test("distinct TPIDR_EL0 values receive distinct persistent TIDs", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, 178n).result.result, "1000");
	fixture.registers.pc = 0x9000n;
	fixture.systemRegisters.write("TPIDR_EL0", 0xdcban);
	assert.equal(invoke(fixture, 178n).result.result, "1001");
});

test("unsupported syscall preserves X0 and PC with structured evidence", () => {
	const fixture = createFixture();
	fixture.registers.write(1, 42n);
	assert.throws(
		function invokeUnsupportedSyscall() {
			invoke(fixture, 999n);
		},
		function verifyBoundary(error) {
			assert.equal(error.code, "NATIVE_LINUX_SYSCALL_UNSUPPORTED");
			assert.equal(error.syscallNumber, "999");
			assert.equal(error.syscallArguments[0], "42");
			return true;
		}
	);
	assert.equal(fixture.registers.read(0, 64), 999n);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("Flutter import registry integrates persistent syscall identity", () => {
	const threadIds = createNativeLinuxThreadIds({ firstTid: 3000n });
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeLinuxThreadIds: threadIds
	}));
	const fixture = createFixture(registry, threadIds);
	assert.ok(registry.snapshot().includes("syscall"));
	assert.equal(invoke(fixture, 178n).result.result, "3000");
});

function createFixture(
	registry = createNativeHostImportRegistry(),
	threadIds = createNativeLinuxThreadIds()
) {
	if (!registry.snapshot().includes("syscall")) {
		registerNativeLinuxSyscallHandlers(registry, threadIds);
	}
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: 0xabcdn });
	return Object.freeze({ registers, registry, systemRegisters, threadIds });
}

function invoke(fixture, syscallNumber) {
	fixture.registers.write(0, syscallNumber);
	return fixture.registry.handle(
		Object.freeze({ name: "syscall" }),
		Object.freeze({
			registers: fixture.registers,
			systemRegisters: fixture.systemRegisters
		})
	);
}
