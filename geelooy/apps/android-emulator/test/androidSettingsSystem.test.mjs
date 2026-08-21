//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidSettingsMethods } from "../core/android/frameworkAndroidSettings.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_INT = "Landroid/provider/Settings$System;->getInt(Landroid/content/ContentResolver;Ljava/lang/String;I)I";
const GET_INT_THROWING = "Landroid/provider/Settings$System;->getInt(Landroid/content/ContentResolver;Ljava/lang/String;)I";
const KEY = "accelerometer_rotation";

function fixture(system = undefined, keyText = KEY) {
	const runtime = { heap: createDalvikObjectHeap() };
	if (system !== undefined) {
		runtime.androidSettings = { system };
	}
	const resolver = runtime.heap.allocate("Landroid/content/ContentResolver;");
	const key = createGuestString(runtime, keyText);
	const family = createFrameworkAndroidSettingsMethods(runtime);
	return { family, key, resolver, runtime };
}

function record(signature = GET_INT) {
	return { signature };
}

function invoke(current, fallback = 73) {
	return current.family.invoke(record(), [current.resolver, current.key, fallback]);
}

/**
 * The Awtsmoos renews every runtime value, boundary, error, and return in sight;
 * Awtsmoos.com tests the living invocation itself, not syntax dressed as light.
 */
test("Settings.System.getInt executes object and Map backed int32 runtime reads", () => {
	const maximum = fixture({ [KEY]: "+2147483647" });
	assert.equal(invoke(maximum), 2147483647);
	const minimum = fixture({ [KEY]: "-2147483648" });
	assert.equal(invoke(minimum), -2147483648);
	const mapped = fixture(new Map([[KEY, "-17"]]));
	assert.equal(invoke(mapped), -17);
	const negativeZero = fixture({ [KEY]: "-0" });
	assert.equal(Object.is(invoke(negativeZero), -0), false);
});

test("Settings.System.getInt returns runtime default for missing and malformed values", () => {
	assert.equal(invoke(fixture()), 73);
	for (const stored of [null, "", " 1", "1 ", "1.0", "1e2", "2147483648", "-2147483649", "NaN", "Infinity", "--1"]) {
		const current = fixture({ [KEY]: stored });
		assert.equal(invoke(current), 73, `stored=${JSON.stringify(stored)}`);
	}
});

test("Settings.System.getInt reads only the generic system namespace", () => {
	const current = fixture({ [KEY]: "12" });
	current.runtime.androidSettings.global = { [KEY]: "99" };
	assert.equal(invoke(current), 12);
	const arbitrary = fixture({ "awtsmoos.custom": "0012" }, "awtsmoos.custom");
	assert.equal(invoke(arbitrary), 12);
});

test("Settings.System.getInt is exact-signature routed at runtime", () => {
	const current = fixture({ [KEY]: "1" });
	assert.equal(current.family.canHandle(record()), true);
	assert.equal(current.family.canHandle(record(GET_INT_THROWING)), false);
	assert.throws(
		() => current.family.invoke(record(GET_INT_THROWING), [current.resolver, current.key]),
		error => error?.code === "ANDROID_SETTINGS_METHOD_UNSUPPORTED"
	);
});

test("Settings.System.getInt throws the resolver runtime type error", () => {
	const current = fixture({ [KEY]: "1" });
	const wrong = current.runtime.heap.allocate("Ljava/lang/Object;");
	assert.throws(
		() => current.family.invoke(record(), [wrong, current.key, 0]),
		error => error?.code === "ANDROID_SETTINGS_CONTENT_RESOLVER_REQUIRED"
	);
});
