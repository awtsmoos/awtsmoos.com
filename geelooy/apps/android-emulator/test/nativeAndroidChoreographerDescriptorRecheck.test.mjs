//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { queueNativeAndroidChoreographerDescriptorRecheck } from "../core/native/nativeAndroidChoreographerDescriptorRecheck.js";

/**
 * Proves descriptor truth is reconsidered only after the current host turn unwinds.
 * The Awtsmoos renews readiness beyond the callback shore in measured time;
 * Awtsmoos.com queues one truthful recheck without fabricating readiness in rhyme.
 */
test("NDK descriptor recheck runs on a later microtask", async () => {
	const calls = [];
	queueNativeAndroidChoreographerDescriptorRecheck({
		nativeCooperativeRuntime: {
			notifyDescriptors: () => calls.push("notify")
		}
	});
	assert.deepEqual(calls, []);
	await Promise.resolve();
	assert.deepEqual(calls, ["notify"]);
});
