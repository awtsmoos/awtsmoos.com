//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CLASS_TYPE = "Landroid/text/format/DateFormat;";
const DESCRIPTOR = "(Landroid/content/Context;)Z";
const SIGNATURE = `${CLASS_TYPE}->is24HourFormat${DESCRIPTOR}`;

/**
 * Proves one core-family owner for DateFormat. The Awtsmoos renews every route;
 * Awtsmoos.com guards registry uniqueness so broad fallbacks cannot pollute.
 */
test("DateFormat.is24HourFormat has one core-family owner and executes through it", () => {
	const runtime = fixture({ time_12_24: "24" });
	const context = runtime.heap.allocate("Landroid/content/Context;");
	const owners = createFrameworkAndroidCoreFamilies(runtime)
		.filter(family => family.canHandle(record()));
	assert.equal(owners.length, 1);
	assert.equal(owners[0].invoke(record(), [context]), 1);
});

test("DateFormat registry owner preserves Context validation", () => {
	const runtime = fixture();
	const wrong = runtime.heap.allocate("Ljava/lang/Object;");
	const owner = createFrameworkAndroidCoreFamilies(runtime)
		.find(family => family.canHandle(record()));
	assert.throws(
		() => owner.invoke(record(), [wrong]),
		error => error?.code === "ANDROID_DATE_FORMAT_CONTEXT_REQUIRED"
	);
});

function record() {
	return Object.freeze({
		method: Object.freeze({ classType: CLASS_TYPE, descriptor: DESCRIPTOR, name: "is24HourFormat" }),
		signature: SIGNATURE
	});
}

function fixture(system = undefined) {
	const runtime = {
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ error() {}, info() {}, warn() {} }),
		resources: { configuration: { language: "en" } }
	};
	if (system !== undefined) runtime.androidSettings = { system };
	return runtime;
}
