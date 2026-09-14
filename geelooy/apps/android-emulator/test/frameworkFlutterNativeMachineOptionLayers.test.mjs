//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Guards the two distinct Flutter native machine-option layers.
 *
 * The Awtsmoos renews session construction and one-call execution as separate
 * covenants. Awtsmoos.com forbids a per-invocation option builder from replacing
 * the capability options consumed while the persistent JNI machine is created.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	createFrameworkFlutterNativeCallMachineOptions
} from "../core/android/frameworkFlutterNativeCallMachineOptions.js";
import { createFrameworkFlutterNativeMachineOptions } from "../core/android/frameworkFlutterNativeMachineOptions.js";
import {
	createCallOptionSession,
	createSessionOptionResolver,
	createSessionOptionRuntime
} from "./frameworkFlutterNativeMachineOptionLayersSupport.mjs";

/** Proves session options carry runtime capabilities without requiring a session. */
test("session machine options preserve JNI construction capabilities", () => {
	const imports = Object.freeze({ name: "imports" });
	const runtime = createSessionOptionRuntime();
	const resolver = createSessionOptionResolver();
	const options = createFrameworkFlutterNativeMachineOptions(
		runtime,
		imports,
		resolver,
		Object.freeze({ resolveArrayLength: () => 3 }),
		Object.freeze({ resolveString: () => "text" })
	);
	assert.equal(options.imports, imports);
	assert.equal(options.nativeGraphicsTrace, runtime.graphics);
	assert.equal(options.nativeSocketAdapter, runtime.nativeSocketAdapter);
	assert.equal(options.packageFilesystem, runtime.filesystem);
	assert.equal(options.resolveClass, resolver.resolveClass);
	assert.equal(options.resolveMethod, resolver.resolveMethod);
	assert.equal(options.resolveArrayLength(), 3);
	assert.equal(options.resolveString(), "text");
});

/** Proves call options consume an already-created session and exact registers. */
test("call machine options bind one invocation to persistent native state", () => {
	const registers = createAarch64Registers();
	const memory = Object.freeze({ name: "memory" });
	const session = createCallOptionSession(memory);
	const runtime = Object.freeze({
		nativeMachineCheckpointInstructions: 4096
	});
	const record = Object.freeze({
		method: Object.freeze({
			classType: "Lexample/Flutter;",
			descriptor: "()V",
			name: "nativeWork"
		})
	});
	const options = createFrameworkFlutterNativeCallMachineOptions(
		runtime,
		session,
		record,
		7,
		0x9000n,
		registers
	);
	assert.equal(options.memory, memory);
	assert.equal(options.hostImports, session.hostImports);
	assert.equal(options.imports, session.imports);
	assert.equal(options.registers, registers);
	assert.equal(options.returnAddress, 0x7777n);
	assert.equal(options.instructionLimit, 60000000);
	assert.equal(options.hostCallLimit, 131072);
});
