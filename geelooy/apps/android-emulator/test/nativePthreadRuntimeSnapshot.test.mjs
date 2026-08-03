//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { retainNativePthreadRuntimeSnapshotSource, snapshotNativePthreadRuntime } from "../core/native/nativePthreadRuntimeSnapshot.js";

test("missing registries return eight frozen empty synchronization arrays", () => {
	const snapshot = snapshotNativePthreadRuntime({});
	assert.equal(Object.isFrozen(snapshot), true);
	assert.deepEqual(Object.keys(snapshot).sort(), [
		"conditions", "cooperativeWaits", "externalWakes", "mutexWaitQueue",
		"mutexes", "reacquireQueue", "runnableThreads", "threads"
	]);
	for (const value of Object.values(snapshot)) assert.deepEqual(value, []);
});

test("retained registries expose direct and condition mutex queues separately", () => {
	const registry = {};
	retainNativePthreadRuntimeSnapshotSource(registry, createSource("alpha"));
	assert.deepEqual(snapshotNativePthreadRuntime(registry), {
		conditions: ["alpha-condition"],
		cooperativeWaits: ["alpha-cooperative"],
		externalWakes: ["alpha-external"],
		mutexes: ["alpha-mutex"],
		mutexWaitQueue: ["alpha-direct"],
		reacquireQueue: ["alpha-reacquire"],
		runnableThreads: ["alpha-runnable"],
		threads: ["alpha-thread"]
	});
});

test("registry identity prevents pthread evidence leakage", () => {
	const first = {};
	const second = {};
	retainNativePthreadRuntimeSnapshotSource(first, createSource("first"));
	retainNativePthreadRuntimeSnapshotSource(second, createSource("second"));
	assert.deepEqual(snapshotNativePthreadRuntime(first).mutexWaitQueue, ["first-direct"]);
	assert.deepEqual(snapshotNativePthreadRuntime(second).threads, ["second-thread"]);
});

function createSource(prefix) {
	return {
		conditions: snap(`${prefix}-condition`),
		cooperativeRuntime: snap(`${prefix}-cooperative`),
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
function snap(value) { return Object.freeze({ snapshot: () => Object.freeze([value]) }); }
