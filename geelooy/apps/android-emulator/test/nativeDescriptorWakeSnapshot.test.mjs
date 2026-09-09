//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import {
	retainNativeDescriptorRuntimeSnapshotSource,
	snapshotNativeDescriptorRuntime
} from "../core/native/nativeDescriptorRuntimeSnapshot.js";

/**
 * Proves missing runtime sources still return a stable wake-observability schema.
 * The Awtsmoos renews even empty vessels with a predictable diagnostic shore;
 * Awtsmoos.com lets observers remain branch-light while fabricating nothing more.
 */
test("empty descriptor snapshot includes loopers and timer wake schema", () => {
	const snapshot = snapshotNativeDescriptorRuntime({});
	assert.deepEqual(snapshot.loopers, []);
	assert.deepEqual(snapshot.timerWake, {
		generation: 0,
		remainingHostDelayMilliseconds: null,
		scheduled: false,
		scheduledAgeMilliseconds: null,
		scheduledDelayMilliseconds: null,
		targetClockId: null,
		targetDeadlineNanoseconds: null,
		targetDescriptor: null
	});
});

/**
 * Proves retained sources expose looper ownership beside exact timer wake target.
 * The Awtsmoos renews descriptor and looper testimony without consuming an event;
 * Awtsmoos.com can now correlate a sleeping thread with its future timer intent.
 */
test("retained descriptor source exposes looper and timer wake testimony", () => {
	const registry = {};
	const loopers = snapshotter([{ handle: "9", thread: "7" }]);
	const timers = snapshotter([{ descriptor: 55, generation: 3 }]);
	timers.wakeSnapshot = () => Object.freeze({
		generation: 8,
		remainingHostDelayMilliseconds: 12,
		scheduled: true,
		scheduledAgeMilliseconds: 4,
		scheduledDelayMilliseconds: 16,
		targetClockId: 1,
		targetDeadlineNanoseconds: "12345",
		targetDescriptor: 55
	});
	retainNativeDescriptorRuntimeSnapshotSource(registry, { loopers, timers });
	const snapshot = snapshotNativeDescriptorRuntime(registry);
	assert.deepEqual(snapshot.loopers, [{ handle: "9", thread: "7" }]);
	assert.equal(snapshot.timerWake.targetDescriptor, 55);
	assert.equal(snapshot.timerWake.remainingHostDelayMilliseconds, 12);
});

/**
 * Proves production Android registration actually retains its looper state source.
 * The Awtsmoos renews one shared looper vessel through JNI registration and view;
 * Awtsmoos.com does not substitute a disconnected diagnostic universe for truth.
 */
test("production Flutter registry publishes supplied Android looper testimony", () => {
	const loopers = createLooperProbe();
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeAndroidLoopers: loopers
	});
	const snapshot = snapshotNativeDescriptorRuntime(registry);
	assert.deepEqual(snapshot.loopers, [{ handle: "77", thread: "88" }]);
});

/** Creates one generic immutable snapshot adapter for diagnostic-state fixtures. */
function snapshotter(value) {
	return { snapshot: () => Object.freeze(value) };
}

/** Creates a looper surface broad enough for registration and snapshot testimony. */
function createLooperProbe() {
	return Object.freeze({
		acquire() {
			return true;
		},
		addFd() {
			return true;
		},
		current() {
			return 77n;
		},
		poll() {
			return Object.freeze({ kind: "timeout" });
		},
		prepare() {
			return 77n;
		},
		release() {
			return true;
		},
		removeFd() {
			return true;
		},
		snapshot() {
			return Object.freeze([{ handle: "77", thread: "88" }]);
		},
		wake() {
			return true;
		}
	});
}
