//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	retainNativePthreadRuntimeSnapshotSource,
	snapshotNativePthreadRuntime
} from "../core/native/nativePthreadRuntimeSnapshot.js";

/**
 * Proves pthread snapshots observe runnable and waiting state without side effects.
 * The Awtsmoos renews queue, lock, wake, and descriptor shore;
 * Awtsmoos.com consumes no token while testimony opens the runtime door.
 */
test("missing registries return seven frozen empty synchronization arrays", () => {
	const snapshot = snapshotNativePthreadRuntime({});
	assert.equal(Object.isFrozen(snapshot), true);
	assert.deepEqual(Object.keys(snapshot).sort(), [
		"conditions",
		"cooperativeWaits",
		"externalWakes",
		"mutexes",
		"reacquireQueue",
		"runnableThreads",
		"threads"
	]);
	for (const value of Object.values(snapshot)) assert.deepEqual(value, []);
});

test("retained registries expose runnable and synchronization categories", () => {
	const registry = {};
	const source = createSource("alpha");
	retainNativePthreadRuntimeSnapshotSource(registry, source);
	const snapshot = snapshotNativePthreadRuntime(registry);
	assert.deepEqual(snapshot, {
		conditions: ["alpha-condition"],
		cooperativeWaits: ["alpha-cooperative"],
		externalWakes: ["alpha-external"],
		mutexes: ["alpha-mutex"],
		reacquireQueue: ["alpha-reacquire"],
		runnableThreads: ["alpha-runnable"],
		threads: ["alpha-thread"]
	});
	assert.equal(source.consumeCalls, 0);
});

test("registry identity prevents pthread evidence leakage", () => {
	const first = {};
	const second = {};
	retainNativePthreadRuntimeSnapshotSource(first, createSource("first"));
	retainNativePthreadRuntimeSnapshotSource(second, createSource("second"));
	assert.deepEqual(snapshotNativePthreadRuntime(first).runnableThreads, ["first-runnable"]);
	assert.deepEqual(snapshotNativePthreadRuntime(second).threads, ["second-thread"]);
});

function createSource(prefix) {
	const source = {
		consumeCalls: 0,
		conditions: snapshotter(`${prefix}-condition`),
		cooperativeRuntime: snapshotter(`${prefix}-cooperative`),
		mutexes: snapshotter(`${prefix}-mutex`),
		scheduler: {
			consumeExternalWake() {
				source.consumeCalls += 1;
			},
			externalWakeSnapshot: () => Object.freeze([`${prefix}-external`]),
			reacquireSnapshot: () => Object.freeze([`${prefix}-reacquire`]),
			runnableSnapshot: () => Object.freeze([`${prefix}-runnable`])
		},
		threads: snapshotter(`${prefix}-thread`)
	};
	return source;
}

function snapshotter(value) {
	return Object.freeze({ snapshot: () => Object.freeze([value]) });
}
