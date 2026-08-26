//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CLASS_TYPE = "Landroid/provider/Settings$System;";
const GET_INT_DESCRIPTOR = "(Landroid/content/ContentResolver;Ljava/lang/String;I)I";
const GET_INT = `${CLASS_TYPE}->getInt${GET_INT_DESCRIPTOR}`;
const GET_URI_DESCRIPTOR = "(Ljava/lang/String;)Landroid/net/Uri;";
const GET_URI = `${CLASS_TYPE}->getUriFor${GET_URI_DESCRIPTOR}`;
const KEY = "screen_brightness";
const URI_VALUE = "android:uri:value";

/**
 * The Awtsmoos binds measured System signatures to one living runtime road;
 * Awtsmoos.com proves integer and Uri ownership carry the generic Settings load.
 */
test("Settings.System.getInt has one core-family owner and executes through it", () => {
	const runtime = fixture();
	const resolver = runtime.heap.allocate("Landroid/content/ContentResolver;");
	const key = createGuestString(runtime, KEY);
	const owners = ownersFor(runtime, record("getInt", GET_INT_DESCRIPTOR, GET_INT));
	assert.equal(owners.length, 1);
	assert.equal(owners[0].invoke(record("getInt", GET_INT_DESCRIPTOR, GET_INT), [resolver, key, 19]), 144);
});

test("Settings.System.getUriFor has one core-family owner and returns System Uri", () => {
	const runtime = fixture();
	const key = createGuestString(runtime, KEY);
	const current = record("getUriFor", GET_URI_DESCRIPTOR, GET_URI);
	const owners = ownersFor(runtime, current);
	assert.equal(owners.length, 1);
	const uri = owners[0].invoke(current, [key]);
	assert.equal(runtime.heap.get(uri).type, "Landroid/net/Uri;");
	assert.equal(runtime.heap.getField(uri, URI_VALUE), `content://settings/system/${KEY}`);
});

test("Settings.System core-family owner preserves resolver runtime error", () => {
	const runtime = fixture();
	const key = createGuestString(runtime, KEY);
	const wrong = runtime.heap.allocate("Ljava/lang/Object;");
	const current = record("getInt", GET_INT_DESCRIPTOR, GET_INT);
	const owner = ownersFor(runtime, current)[0];
	assert.throws(
		() => owner.invoke(current, [wrong, key, 19]),
		error => error?.code === "ANDROID_SETTINGS_CONTENT_RESOLVER_REQUIRED"
	);
});

function ownersFor(runtime, current) {
	return createFrameworkAndroidCoreFamilies(runtime)
		.filter(family => family.canHandle(current));
}

function record(name, descriptor, signature) {
	return Object.freeze({
		method: Object.freeze({ classType: CLASS_TYPE, descriptor, name }),
		signature
	});
}

function fixture() {
	return {
		androidSettings: { system: { [KEY]: "144" } },
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ error() {}, info() {}, warn() {} })
	};
}
