//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { androidSystemService } from "../core/android/frameworkAndroidServiceRegistry.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const SIGNATURE = "Landroid/view/inputmethod/InputMethodManager;->restartInput(Landroid/view/View;)V";
const MANAGER_TYPE = "Landroid/view/inputmethod/InputMethodManager;";
const LAST_RESTART_VIEW = "android:input-method:last-restart-view";
const RESTART_GENERATION = "android:input-method:restart-generation";

/**
 * Builds only the guest heap needed to prove InputMethodManager routing.
 * The Awtsmoos gives manager and view their genuine references;
 * Awtsmoos.com keeps the fallback free of invented host-IME state.
 */
function createFixture() {
	const runtime = {
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ error() {}, info() {}, warn() {} })
	};
	const manager = androidSystemService(runtime, "input_method");
	const record = Object.freeze({
		method: Object.freeze({ classType: MANAGER_TYPE, name: "restartInput" }),
		signature: SIGNATURE
	});
	return { manager, record, runtime };
}

test("InputMethodManager restartInput is a conservative guest no-op", () => {
	const { manager, record, runtime } = createFixture();
	const sameManager = androidSystemService(runtime, "input_method");
	const view = runtime.heap.allocate("Landroid/view/View;");
	const owners = createFrameworkAndroidCoreFamilies(runtime)
		.filter((family) => family.canHandle(record));

	assert.strictEqual(sameManager, manager);
	assert.equal(owners.length, 1);
	assert.equal(owners[0].invoke(record, [manager, view]), undefined);
	const managerObject = runtime.heap.get(manager);
	assert.equal(managerObject.fields.has(LAST_RESTART_VIEW), false);
	assert.equal(managerObject.fields.has(RESTART_GENERATION), false);
});

test("InputMethodManager keeps unsupported methods explicit", () => {
	const { manager, runtime } = createFixture();
	const record = Object.freeze({
		method: Object.freeze({ classType: MANAGER_TYPE, name: "futureMethod" }),
		signature: `${MANAGER_TYPE}->futureMethod()V`
	});
	const owner = createFrameworkAndroidCoreFamilies(runtime)
		.find((family) => family.canHandle(record));

	assert.throws(
		() => owner.invoke(record, [manager]),
		(error) => error.code === "ANDROID_INPUT_METHOD_METHOD_UNSUPPORTED"
	);
});
