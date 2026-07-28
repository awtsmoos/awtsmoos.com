//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchInitialActivity } from "../core/android/activityLifecycle.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ACTIVITY = "Lexample/Activity;";
const CALLBACK = "Lexample/LifecycleCallback;";

/**
 * Proves Activity phases awaken registered guest callbacks in Android order.
 * The Awtsmoos recreates Activity, Bundle, callback method, and awaited frame
 * anew; Awtsmoos.com records real resolved DEX calls rather than synthetic names.
 */
test("Activity lifecycle dispatches exact registered callback methods", async () => {
	const fixture = createFixture(true);
	const result = await launchInitialActivity(
		fixture.executor,
		fixture.launcher,
		fixture.runtime
	);
	assert.deepEqual(fixture.calls.map(call => call.signature), [
		`${ACTIVITY}-><init>()V`,
		`${ACTIVITY}->onCreate(Landroid/os/Bundle;)V`,
		`${CALLBACK}->onActivityCreated(Landroid/app/Activity;Landroid/os/Bundle;)V`,
		`${ACTIVITY}->onStart()V`,
		`${CALLBACK}->onActivityStarted(Landroid/app/Activity;)V`,
		`${ACTIVITY}->onResume()V`,
		`${CALLBACK}->onActivityResumed(Landroid/app/Activity;)V`
	]);
	const created = fixture.calls[2];
	assert.equal(created.args[0], fixture.callback);
	assert.equal(created.args[1], result.activity);
	assert.equal(fixture.runtime.heap.get(created.args[2]).type, "Landroid/os/Bundle;");
	assert.equal(fixture.calls[4].args[1], result.activity);
	assert.equal(fixture.calls[6].args[1], result.activity);
	assert.deepEqual(result.lifecycle, ["onCreate", "onStart", "onResume"]);
});

test("empty callback collection preserves existing Activity lifecycle", async () => {
	const fixture = createFixture(false);
	const result = await launchInitialActivity(
		fixture.executor,
		fixture.launcher,
		fixture.runtime
	);
	assert.deepEqual(fixture.calls.map(call => call.record.method.name), [
		"<init>",
		"onCreate",
		"onStart",
		"onResume"
	]);
	assert.deepEqual(result.lifecycle, ["onCreate", "onStart", "onResume"]);
});

function createFixture(registerCallback) {
	const heap = createDalvikObjectHeap();
	const callback = heap.allocate(CALLBACK);
	const callbackRecords = [
		record(CALLBACK, "onActivityCreated", "(Landroid/app/Activity;Landroid/os/Bundle;)V", [], 3),
		record(CALLBACK, "onActivityStarted", "(Landroid/app/Activity;)V", [], 2),
		record(CALLBACK, "onActivityResumed", "(Landroid/app/Activity;)V", [], 2)
	];
	const calls = [];
	const runtime = {
		activityLifecycleCallbacks: registerCallback ? [callback] : [],
		heap,
		registry: { list: callbackRecords }
	};
	return {
		callback,
		calls,
		executor: {
			async invoke(invocationRecord, args) {
				calls.push({ args, record: invocationRecord, signature: invocationRecord.signature });
			}
		},
		launcher: {
			constructor: record(ACTIVITY, "<init>", "()V", [], 1),
			lifecycle: [
				{ name: "onCreate", record: record(ACTIVITY, "onCreate", "(Landroid/os/Bundle;)V", ["Landroid/os/Bundle;"], 2) },
				{ name: "onStart", record: record(ACTIVITY, "onStart", "()V", [], 1) },
				{ name: "onResume", record: record(ACTIVITY, "onResume", "()V", [], 1) }
			],
			type: ACTIVITY
		},
		runtime
	};
}

function record(classType, name, descriptor, parameters, insSize) {
	return {
		code: { insSize },
		encoded: { accessFlags: 0 },
		method: { classType, descriptor, name, prototype: { parameters } },
		signature: `${classType}->${name}${descriptor}`
	};
}
