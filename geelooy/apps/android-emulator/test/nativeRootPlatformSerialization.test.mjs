//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { runFrameworkFlutterNativeRootExecution } from "../core/android/frameworkFlutterNativeRootExecution.js";
import { createNativeAndroidPlatformLooperPump } from "../core/native/nativeAndroidPlatformLooperPump.js";
import { createNativeRootExecutionState } from "../core/native/nativeRootExecutionState.js";

/** Proves nested leases preserve root ownership until the outermost leave. */
test("root execution lease preserves nested platform-thread ownership", () => {
	const lease = createNativeRootExecutionState();
	assert.equal(lease.active(), false);
	assert.equal(lease.enter().depth, 1);
	assert.equal(lease.enter().depth, 2);
	assert.equal(lease.leave().idle, false);
	const released = lease.leave();
	assert.equal(released.idle, true);
	assert.equal(released.maximumDepth, 2);
	assert.throws(() => lease.leave(), error => {
		return error.code === "NATIVE_ROOT_EXECUTION_UNBALANCED";
	});
});

/**
 * Proves an awaited JNI operation remains leased across browser promise turns and
 * re-notifies descriptors only after a successful outermost native return.
 */
test("Flutter native root execution defers descriptor service until return", async () => {
	const lease = createNativeRootExecutionState();
	let notifications = 0;
	const session = fakeSession(lease, () => {
		notifications += 1;
	});
	const result = await runFrameworkFlutterNativeRootExecution(session, async () => {
		assert.equal(lease.active(), true);
		await Promise.resolve();
		assert.equal(lease.active(), true);
		return "returned";
	});
	assert.equal(result, "returned");
	assert.equal(lease.active(), false);
	assert.equal(notifications, 1);
});

/** Proves failed native work releases ownership without running deferred platform work. */
test("failed root execution releases lease without descriptor notification", async () => {
	const lease = createNativeRootExecutionState();
	let notifications = 0;
	const session = fakeSession(lease, () => {
		notifications += 1;
	});
	await assert.rejects(
		runFrameworkFlutterNativeRootExecution(session, async () => {
			throw new Error("guest-boundary");
		}),
		/guest-boundary/
	);
	assert.equal(lease.active(), false);
	assert.equal(notifications, 0);
});

/** Proves a busy root thread leaves callback readiness wholly unconsumed. */
test("platform pump does not poll callback readiness while root JNI is active", () => {
	const lease = createNativeRootExecutionState();
	let polls = 0;
	const machineState = Object.freeze({
		nativeRootExecution: lease,
		thread: Object.freeze({ pointer: "99" })
	});
	const pump = createNativeAndroidPlatformLooperPump({
		machineState,
		registry: Object.freeze({}),
		state: Object.freeze({
			pollCallback() {
				polls += 1;
				return Object.freeze({ kind: "timeout" });
			}
		})
	});
	lease.enter();
	assert.deepEqual(pump.drain(), []);
	assert.equal(polls, 0);
	assert.equal(pump.snapshot().deferredDrains, 1);
	lease.leave();
	assert.deepEqual(pump.drain(), []);
	assert.equal(polls, 1);
});

/** Builds the minimum persistent session contract used by the lease helper. */
function fakeSession(lease, notifyDescriptors) {
	return Object.freeze({
		state: Object.freeze({
			nativeCooperativeRuntime: Object.freeze({ notifyDescriptors }),
			nativeRootExecution: lease
		})
	});
}
