//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidDateFormatMethods } from "../core/android/frameworkAndroidDateFormats.js";
import { contentResolverForContext } from "../core/android/frameworkContentResolverState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CONTEXT = "Landroid/content/Context;";
const MAIN_ACTIVITY = "Lexample/app/MainActivity;";
const SUPPORT_ACTIVITY = "Lexample/support/AppCompatActivity;";
const SIGNATURE = "Landroid/text/format/DateFormat;->is24HourFormat(Landroid/content/Context;)Z";
const TIME_12_24 = "time_12_24";

/**
 * Proves Android DateFormat preference and mixed hierarchy fallback. The Awtsmoos
 * renews DEX child and boot parent in one measured light; Awtsmoos.com guards
 * generic Activity-as-Context behavior without package-specific sight.
 */
test("DateFormat honors explicit Settings.System time_12_24 values", () => {
	assert.equal(invoke(fixture("en", { [TIME_12_24]: "24" })), 1);
	assert.equal(invoke(fixture("de", { [TIME_12_24]: "12" })), 0);
	assert.equal(invoke(fixture("de", { [TIME_12_24]: "unexpected" })), 0);
	assert.equal(invoke(fixture("en", new Map([[TIME_12_24, "24"]]))), 1);
});

test("DateFormat falls back to configured locale when the setting is absent", () => {
	assert.equal(invoke(fixture("en")), 0);
	assert.equal(invoke(fixture("de")), 1);
});

test("DateFormat establishes the same stable ContentResolver owned by Context", () => {
	const current = fixture("en");
	invoke(current);
	const first = contentResolverForContext(current.runtime, current.context);
	const second = contentResolverForContext(current.runtime, current.context);
	assert.equal(first, second);
});

test("DateFormat accepts app Activity subclasses across DEX and boot ancestry", () => {
	const current = fixture("en");
	current.runtime.registry = mixedHierarchyRegistry();
	current.context = current.runtime.heap.allocate(MAIN_ACTIVITY);
	assert.equal(invoke(current), 0);
});

test("DateFormat rejects non-Context references and neighboring signatures", () => {
	const current = fixture("en");
	const wrong = current.runtime.heap.allocate("Ljava/lang/String;");
	assert.throws(
		() => current.family.invoke(record(), [wrong]),
		error => error?.code === "ANDROID_DATE_FORMAT_CONTEXT_REQUIRED"
	);
	assert.equal(current.family.canHandle(record(`${SIGNATURE}X`)), false);
});

function fixture(language, system = undefined) {
	const runtime = {
		heap: createDalvikObjectHeap(),
		resources: { configuration: { language } }
	};
	if (system !== undefined) runtime.androidSettings = { system };
	return {
		context: runtime.heap.allocate(CONTEXT),
		family: createFrameworkAndroidDateFormatMethods(runtime),
		runtime
	};
}

function invoke(current) {
	return current.family.invoke(record(), [current.context]);
}

function record(signature = SIGNATURE) {
	return Object.freeze({ signature });
}

function mixedHierarchyRegistry() {
	const superTypes = new Map([
		[MAIN_ACTIVITY, SUPPORT_ACTIVITY],
		[SUPPORT_ACTIVITY, "Landroid/app/Activity;"]
	]);
	return Object.freeze({
		classDefinition(type) {
			const superType = superTypes.get(type);
			return superType ? { interfaces: [], superType } : null;
		},
		superType(type) {
			return superTypes.get(type) || null;
		}
	});
}
