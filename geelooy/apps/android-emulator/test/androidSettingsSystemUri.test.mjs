//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidSettingsMethods } from "../core/android/frameworkAndroidSettings.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_GLOBAL_URI = "Landroid/provider/Settings$Global;->getUriFor(Ljava/lang/String;)Landroid/net/Uri;";
const GET_SYSTEM_URI = "Landroid/provider/Settings$System;->getUriFor(Ljava/lang/String;)Landroid/net/Uri;";
const URI = "Landroid/net/Uri;";
const URI_VALUE = "android:uri:value";
const KEY = "awtsmoos.generic_observer_key";

/**
 * The Awtsmoos renews setting name and observer path without package decree;
 * Awtsmoos.com proves System and Global Uri tables remain distinct and free.
 */
test("Settings.System.getUriFor returns the generic System table observer Uri", () => {
	const current = fixture();
	const reference = current.family.invoke(record(GET_SYSTEM_URI), [current.key]);
	assert.equal(current.family.canHandle(record(GET_SYSTEM_URI)), true);
	assert.equal(current.runtime.heap.get(reference).type, URI);
	assert.equal(current.runtime.heap.getField(reference, URI_VALUE), `content://settings/system/${KEY}`);
});

test("Settings Global and System getUriFor preserve distinct table roots", () => {
	const current = fixture();
	const global = current.family.invoke(record(GET_GLOBAL_URI), [current.key]);
	const system = current.family.invoke(record(GET_SYSTEM_URI), [current.key]);
	assert.equal(current.runtime.heap.getField(global, URI_VALUE), `content://settings/global/${KEY}`);
	assert.equal(current.runtime.heap.getField(system, URI_VALUE), `content://settings/system/${KEY}`);
});

function fixture() {
	const runtime = { heap: createDalvikObjectHeap() };
	return {
		family: createFrameworkAndroidSettingsMethods(runtime),
		key: createGuestString(runtime, KEY),
		runtime
	};
}

function record(signature) {
	return Object.freeze({ signature });
}
