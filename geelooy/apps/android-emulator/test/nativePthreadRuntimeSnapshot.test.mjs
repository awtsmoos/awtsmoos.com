//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	retainNativePthreadRuntimeSnapshotSource,
	snapshotNativePthreadRuntime
} from "../core/native/nativePthreadRuntimeSnapshot.js";

/**
 * Proves a missing registry returns the complete stable diagnostic schema.
 * The platform-loop field is intentionally nullable because no root pump exists yet.
 */
test("missing registries expose the complete frozen pthread schema", () => {
	const snapshot = snapshotNativePthreadRuntime({});
	assert.equal(Object.isFrozen(snapshot), true);
	assert.deepEqual(Object.keys(snapshot).sort(), [
		"conditions",
		"cooperativeWaits",
		"externalWakes",
		"mutexWaitQueue",
		"mutexes",
		"platformLooper",
		"reacquireQueue",
		"runnableThreads",
		"threads"
	]);
	assert.equal(snapshot.platformLooper, null);
	for (const [key, value] of Object.entries(snapshot)) {
		if (key === "platformLooper") continue;
		assert.deepEqual(value, []);
	}
});

/**
 * Proves retained sources expose child-thread queues and root-platform testimony.
 * Each diagnostic lane remains separate so one queue cannot masquerade as another.
 */
test("retained registries expose pthread and platform diagnostics separately", () => {
	const registry = {};
	retainNativePthreadRuntimeSnapshotSource(registry, createSource("alpha"));
	assert.deepEqual(snapshotNativePthreadRuntime(registry), {
		conditions: ["alpha-condition"],
		cooperativeWaits: ["alpha-cooperative"],
		externalWakes: ["alpha-external"],
		mutexes: ["alpha-mutex"],
		mutexWaitQueue: ["alpha-direct"],
		platformLooper: {
			thread: "alpha-platform"
		},
		reacquireQueue: ["alpha-reacquire"],
		runnableThreads: ["alpha-runnable"],
		threads: ["alpha-thread"]
	});
});

/** Proves registry identity keeps diagnostics isolated between independent runtimes. */
test("registry identity prevents pthread evidence leakage", () => {
	const first = {};
	const second = {};
	retainNativePthreadRuntimeSnapshotSource(first, createSource("first"));
	retainNativePthreadRuntimeSnapshotSource(second, createSource("second"));
	assert.deepEqual(snapshotNativePthreadRuntime(first).mutexWaitQueue, ["first-direct"]);
	assert.deepEqual(snapshotNativePthreadRuntime(second).threads, ["second-thread"]);
});

/** Builds one fully populated diagnostic source used by snapshot schema tests. */
function createSource(prefix) {
	return {
		conditions: snap(`${prefix}-condition`),
		cooperativeRuntime: {
			platformLooperSnapshot: () => Object.freeze({
				thread: `${prefix}-platform`
			}),
			snapshot: () => Object.freeze([`${prefix}-cooperative`])
		},
		mutexes: snap(`${prefix}-mutex`),
		scheduler: {
			externalWakeSnapshot: () => Object.freeze([`${prefix}-external`]),
			mutexWaitSnapshot: () => Object.freeze([`${prefix}-direct`]),
			reacquireSnapshot: () => Object.freeze([`${prefix}-reacquire`]),
			runnableSnapshot: () => Object.freeze([`${prefix}-runnable`])
		},
		threads: snap(`${prefix}-thread`)
	};
}

/** Wraps one immutable array-valued snapshot source. */
function snap(value) {
	return Object.freeze({
		snapshot: () => Object.freeze([value])
	});
}
