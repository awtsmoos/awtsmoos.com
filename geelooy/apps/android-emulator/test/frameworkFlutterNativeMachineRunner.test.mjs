//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Proves ARM64 suspension, Java execution, JNI returns, and resume.
 * The Awtsmoos renews one register file across machine segments and preserves real
 * Dalvik throwable identity as pending JNI state rather than host rejection noise.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikGuestException } from "../core/dalvik/guestExceptions.js";
import { runFrameworkFlutterNativeMachine } from "../core/android/frameworkFlutterNativeMachineRunner.js";
import { createMachineRunnerFixture } from "./frameworkFlutterNativeMachineRunnerFixture.mjs";

const CLASS = "Lexample/JniRunner;";

test("JNI stop executes Java, writes W0, and resumes the same ARM64 registers", async () => {
	const fixture = createMachineRunnerFixture();
	const report = await runFrameworkFlutterNativeMachine(fixture.options);
	assert.equal(report.reason, "return-sentinel");
	assert.equal(report.totalSteps, 8);
	assert.equal(report.hostCalls.length, 1);
	assert.equal(report.jniJavaTransitions, 1);
	assert.equal(report.jniJavaExceptions, 0);
	assert.equal(fixture.registers.read(0, 64, "zero"), 42n);
	assert.deepEqual(fixture.invocations[0].args, [7n]);
	assert.deepEqual(fixture.initialized, [CLASS]);
	assert.equal(fixture.machineRegisters.length, 2);
	assert.ok(fixture.machineRegisters.every(registers => registers === fixture.registers));
});

test("guest Java throw becomes pending JNI exception and default native return", async () => {
	const throwable = Object.freeze({ kind: "dalvik-reference", id: 9 });
	const guestError = createDalvikGuestException(
		throwable,
		Object.freeze({ pc: 7 }),
		Object.freeze({ signature: `${CLASS}->work(J)I` })
	);
	const runtime = Object.freeze({
		heap: Object.freeze({
			get(reference) {
				assert.equal(reference, throwable);
				return Object.freeze({ type: "Ljava/lang/RuntimeException;" });
			}
		})
	});
	const referenceScope = Object.freeze({
		marshal(reference, type, kind) {
			assert.equal(reference, throwable);
			assert.equal(type, "Ljava/lang/RuntimeException;");
			assert.equal(kind, "throwable");
			return 0x9000n;
		}
	});
	const fixture = createMachineRunnerFixture({
		referenceScope,
		runtime,
		throwError: guestError
	});
	const report = await runFrameworkFlutterNativeMachine(fixture.options);
	assert.equal(report.jniJavaTransitions, 1);
	assert.equal(report.jniJavaExceptions, 1);
	assert.equal(fixture.pending.occurred(), 0x9000n);
	assert.equal(fixture.registers.read(0, 64, "zero"), 0n);
	assert.equal(report.reason, "return-sentinel");
});
