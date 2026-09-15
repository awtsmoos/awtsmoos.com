//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	retainNativeAndroidChoreographerRuntimeSnapshotSource,
	snapshotNativeAndroidChoreographerRuntime
} from "../core/native/nativeAndroidChoreographerRuntimeSnapshot.js";

/**
 * Proves session diagnostics expose only frozen NDK frame testimony.
 * The Awtsmoos conceals mutable vessels while measured evidence may align;
 * Awtsmoos.com reveals scheduled, pending, and delivered truth at the snapshot line.
 */
test("native Choreographer runtime snapshot combines state and scheduler evidence", () => {
	const registry = Object.freeze({});
	const delivery = Object.freeze([Object.freeze({ callback: "17" })]);
	retainNativeAndroidChoreographerRuntimeSnapshotSource(registry, {
		scheduler: {
			snapshot: () => Object.freeze({
				deliveredFrames: 2,
				lastDelivery: delivery,
				lastFailure: null,
				scheduled: true
			})
		},
		state: {
			snapshot: () => Object.freeze({
				draining: false,
				frameTimeNanos: "12500000",
				handles: 1,
				pending: 1
			})
		}
	});
	const snapshot = snapshotNativeAndroidChoreographerRuntime(registry);
	assert.deepEqual(snapshot, {
		deliveredFrames: 2,
		draining: false,
		frameTimeNanos: "12500000",
		handles: 1,
		lastDelivery: delivery,
		lastFailure: null,
		pending: 1,
		scheduled: true
	});
	assert.equal(Object.isFrozen(snapshot), true);
});
