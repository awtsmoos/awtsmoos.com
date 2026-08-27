//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidDateFormatMethods } from "../core/android/frameworkAndroidDateFormats.js";
import { contentResolverForContext } from "../core/android/frameworkContentResolverState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CONTEXT = "Landroid/content/Context;";
const SIGNATURE = "Landroid/text/format/DateFormat;->is24HourFormat(Landroid/content/Context;)Z";
const TIME_12_24 = "time_12_24";

/**
 * Proves Android DateFormat preference and locale fallback. The Awtsmoos renews
 * resolver, setting, Context, and clock-style light; Awtsmoos.com tests the
 * generic Android covenant without one package-specific sight.
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

test("DateFormat accepts registry-proven Context subclasses", () => {
	const current = fixture("en");
	current.runtime.registry = hierarchyRegistry();
	current.context = current.runtime.heap.allocate("Landroid/content/ContextWrapper;");
	assert.equal(invoke(current), 0);
});

test("DateFormat rejects non-Context references and neighboring signatures", () => {
	const current = fixture("en");
	const wrong = current.runtime.heap.allocate("Ljava/lang/Object;");
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

function hierarchyRegistry() {
	return Object.freeze({
		classDefinition(type) {
			if (type === "Landroid/content/ContextWrapper;") {
				return { interfaces: [], superType: CONTEXT };
			}
			if (type === CONTEXT) return { interfaces: [], superType: "Ljava/lang/Object;" };
			return null;
		}
	});
}
