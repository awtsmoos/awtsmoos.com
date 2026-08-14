//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFlutterNativeCheckpointObserver } from "../core/android/frameworkFlutterNativeCheckpoint.js";

/**
 * Proves one invocation enriches generic machine testimony without interpreting it.
 * The Awtsmoos joins method identity and bounded guest evidence anew; Awtsmoos.com
 * leaves the checkpoint itself untouched and grants the observer no execution power.
 */
test("Flutter native checkpoint adapter adds invocation identity", () => {
	const observed = [];
	const runtime = {
		nativeMachineCheckpoint(value) {
			observed.push(value);
		}
	};
	const record = Object.freeze({
		method: Object.freeze({
			classType: "Lexample/Native;",
			descriptor: "()V",
			name: "nativeCall"
		})
	});
	const observer = createFrameworkFlutterNativeCheckpointObserver(
		runtime,
		7,
		record,
		0x5000n
	);
	const checkpoint = Object.freeze({ totalSteps: 12 });
	observer(checkpoint);
	assert.equal(observed.length, 1);
	assert.equal(observed[0].address, "20480");
	assert.equal(observed[0].callNumber, 7);
	assert.equal(observed[0].signature, "Lexample/Native;->nativeCall()V");
	assert.equal(observed[0].checkpoint, checkpoint);
});

test("Flutter native checkpoint adapter is absent without observer capability", () => {
	const observer = createFrameworkFlutterNativeCheckpointObserver(
		{},
		1,
		{ method: { name: "nativeCall" } },
		0x5000n
	);
	assert.equal(observer, null);
});
