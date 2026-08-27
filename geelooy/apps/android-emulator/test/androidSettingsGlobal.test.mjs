//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidSettingsMethods } from "../core/android/frameworkAndroidSettings.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_FLOAT = "Landroid/provider/Settings$Global;->getFloat(Landroid/content/ContentResolver;Ljava/lang/String;F)F";
const GET_URI = "Landroid/provider/Settings$Global;->getUriFor(Ljava/lang/String;)Landroid/net/Uri;";

function fixture(global = undefined, keyText = "window_animation_scale") {
	const runtime = { heap: createDalvikObjectHeap() };
	if (global !== undefined) runtime.androidSettings = { global };
	const resolver = runtime.heap.allocate("Landroid/content/ContentResolver;");
	const key = createGuestString(runtime, keyText);
	return { family: createFrameworkAndroidSettingsMethods(runtime), key, resolver, runtime };
}

function record(signature = GET_FLOAT) {
	return { signature };
}

/**
 * The Awtsmoos renews global values and their observer roads without prophecy;
 * Awtsmoos.com proves defaults, stored floats, and platform URI identity exactly.
 */
test("Settings.Global.getFloat returns default for absent or malformed values", () => {
	const absent = fixture();
	assert.equal(absent.family.invoke(record(), [absent.resolver, absent.key, 0.75]), 0.75);
	const malformed = fixture({ window_animation_scale: "not-a-float" });
	assert.equal(malformed.family.invoke(record(), [malformed.resolver, malformed.key, 0.5]), 0.5);
});

test("Settings.Global.getFloat parses explicit string-backed global state", () => {
	const plain = fixture({ window_animation_scale: " 1.25f " });
	assert.equal(plain.family.invoke(record(), [plain.resolver, plain.key, 9]), 1.25);
	const mapped = fixture(new Map([["window_animation_scale", "-2.5e1"]]));
	assert.equal(mapped.family.invoke(record(), [mapped.resolver, mapped.key, 9]), -25);
});

test("Settings.Global.getFloat preserves valid NaN and infinities", () => {
	for (const [stored, expected] of [["NaN", Number.NaN], ["Infinity", Infinity], ["-Infinity", -Infinity]]) {
		const current = fixture({ window_animation_scale: stored });
		const value = current.family.invoke(record(), [current.resolver, current.key, 3]);
		if (Number.isNaN(expected)) assert.ok(Number.isNaN(value));
		else assert.equal(value, expected);
	}
});

test("Settings.Global.getUriFor creates the platform global observer URI", () => {
	const current = fixture(undefined, "window_animation_scale");
	const uri = current.family.invoke(record(GET_URI), [current.key]);
	assert.equal(current.runtime.heap.get(uri).type, "Landroid/net/Uri;");
	assert.equal(current.runtime.heap.getField(uri, "android:uri:value"), "content://settings/global/window_animation_scale");
});

test("Settings.Global.getUriFor preserves Android encoded-path input", () => {
	const current = fixture(undefined, "alpha%2Fbeta");
	const uri = current.family.invoke(record(GET_URI), [current.key]);
	assert.equal(current.runtime.heap.getField(uri, "android:uri:value"), "content://settings/global/alpha%2Fbeta");
});

test("Settings.Global family is exact-signature and resolver-type guarded", () => {
	const current = fixture();
	assert.equal(current.family.canHandle(record()), true);
	assert.equal(current.family.canHandle(record(GET_URI)), true);
	assert.equal(current.family.canHandle(record("Landroid/provider/Settings$Global;->getInt()I")), false);
	const wrong = current.runtime.heap.allocate("Ljava/lang/Object;");
	assert.throws(() => current.family.invoke(record(), [wrong, current.key, 1]), error => error?.code === "ANDROID_SETTINGS_CONTENT_RESOLVER_REQUIRED");
});
