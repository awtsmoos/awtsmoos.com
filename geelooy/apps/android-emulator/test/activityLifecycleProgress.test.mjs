//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { launchInitialActivity } from "../core/android/activityLifecycle.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ACTIVITY = "Lexample/MeasuredActivity;";

/**
 * Proves Activity progress surrounds the exact constructor and lifecycle methods.
 * The observer records only authentic executor boundaries and never advances work.
 */
test("Activity progress reports constructor and lifecycle boundaries", async () => {
	const events = [];
	const calls = [];
	const heap = createDalvikObjectHeap();
	const launcher = createLauncher();
	const runtime = {
		activityLifecycleCallbacks: [],
		heap,
		registry: { list: [] }
	};
	await launchInitialActivity(
		{
			async invoke(record) {
				calls.push(record.signature);
			}
		},
		launcher,
		runtime,
		(stage, details) => events.push({ details, stage })
	);
	assert.deepEqual(calls, launcherCalls(launcher));
	assert.deepEqual(events.map(event => event.stage), [
		"constructor:start",
		"constructor:complete",
		"phase:onCreate:start",
		"phase:onCreate:complete",
		"phase:onStart:start",
		"phase:onStart:complete",
		"phase:onResume:start",
		"phase:onResume:complete"
	]);
	assert.equal(events[2].details.signature, launcher.lifecycle[0].record.signature);
});

/** Creates the three measured lifecycle records used by this focused proof. */
function createLauncher() {
	return {
		constructor: record("<init>", "()V", [], 1),
		lifecycle: [
			{ name: "onCreate", record: record("onCreate", "(Landroid/os/Bundle;)V", ["Landroid/os/Bundle;"], 2) },
			{ name: "onStart", record: record("onStart", "()V", [], 1) },
			{ name: "onResume", record: record("onResume", "()V", [], 1) }
		],
		type: ACTIVITY
	};
}
/** Returns the exact executor-call order expected from the launcher fixture. */
function launcherCalls(launcher) {
	return [
		launcher.constructor.signature,
		...launcher.lifecycle.map(phase => phase.record.signature)
	];
}

/** Creates one executable Dalvik method record with exact incoming word count. */
function record(name, descriptor, parameters, insSize) {
	return {
		code: { insSize },
		encoded: { accessFlags: 0 },
		method: {
			classType: ACTIVITY,
			descriptor,
			name,
			prototype: { parameters }
		},
		signature: `${ACTIVITY}->${name}${descriptor}`
	};
}