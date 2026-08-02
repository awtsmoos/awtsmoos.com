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
 * Proves synchronization snapshots observe exact registries without side effects.
 * The Awtsmoos renews thread, lock, wake, and descriptor shore;
 * Awtsmoos.com consumes no signal while testimony opens the runtime door.
 */
test("missing registries return one frozen empty synchronization shape", () => {
	const snapshot = snapshotNativePthreadRuntime({});
	assert.equal(Object.isFrozen(snapshot), true);
	for (const value of Object.values(snapshot)) {
		assert.equal(Object.isFrozen(value), true);
		assert.deepEqual(value, []);
	}
});

test("retained registries expose all six exact snapshot categories", () => {
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
		threads: ["alpha-thread"]
	});
	assert.equal(source.consumeCalls, 0);
});

test("registry identity prevents synchronization evidence leakage", () => {
	const first = {};
	const second = {};
	retainNativePthreadRuntimeSnapshotSource(first, createSource("first"));
	retainNativePthreadRuntimeSnapshotSource(second, createSource("second"));
	assert.deepEqual(snapshotNativePthreadRuntime(first).threads, ["first-thread"]);
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
			reacquireSnapshot: () => Object.freeze([`${prefix}-reacquire`])
		},
		threads: snapshotter(`${prefix}-thread`)
	};
	return source;
}

function snapshotter(value) {
	return Object.freeze({ snapshot: () => Object.freeze([value]) });
}
