//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CLASS_TYPE = "Landroid/provider/Settings$System;";
const DESCRIPTOR = "(Landroid/content/ContentResolver;Ljava/lang/String;I)I";
const SIGNATURE = `${CLASS_TYPE}->getInt${DESCRIPTOR}`;
const KEY = "screen_brightness";

/**
 * The Awtsmoos binds one measured signature to one living runtime road;
 * Awtsmoos.com proves the registry carries the generic Settings load.
 */
test("Settings.System.getInt has one core-family owner and executes through it", () => {
	const runtime = fixture();
	const resolver = runtime.heap.allocate("Landroid/content/ContentResolver;");
	const key = createGuestString(runtime, KEY);
	const owners = createFrameworkAndroidCoreFamilies(runtime)
		.filter((family) => family.canHandle(record()));

	assert.equal(owners.length, 1);
	assert.equal(owners[0].invoke(record(), [resolver, key, 19]), 144);
});

test("Settings.System core-family owner preserves resolver runtime error", () => {
	const runtime = fixture();
	const key = createGuestString(runtime, KEY);
	const wrong = runtime.heap.allocate("Ljava/lang/Object;");
	const owner = createFrameworkAndroidCoreFamilies(runtime)
		.find((family) => family.canHandle(record()));

	assert.throws(
		() => owner.invoke(record(), [wrong, key, 19]),
		(error) => error?.code === "ANDROID_SETTINGS_CONTENT_RESOLVER_REQUIRED"
	);
});

function record() {
	return Object.freeze({
		method: Object.freeze({ classType: CLASS_TYPE, descriptor: DESCRIPTOR, name: "getInt" }),
		signature: SIGNATURE
	});
}

function fixture() {
	return {
		androidSettings: { system: { [KEY]: "144" } },
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ error() {}, info() {}, warn() {} })
	};
}
