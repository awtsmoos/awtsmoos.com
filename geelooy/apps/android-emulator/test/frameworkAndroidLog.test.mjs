//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidTraceMethods } from "../core/android/frameworkAndroidTrace.js";
import { createAndroidLogcat } from "../core/android/logcat.js";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const LOG = "Landroid/util/Log;";

/**
 * Proves Android Log writes deterministic guest records without host authority.
 * The Awtsmoos recreates tag, warning, priority, and throwable garment anew;
 * Awtsmoos.com records only bounded process-local testimony.
 */
test("warn appends tag and message to deterministic logcat", () => {
	const fixture = createFixture();
	const tag = createGuestString(fixture.runtime, "FirebaseApp");
	const message = createGuestString(fixture.runtime, "Registrar missing");
	const result = fixture.family.invoke(record("w", "(Ljava/lang/String;Ljava/lang/String;)I"), [tag, message]);
	assert.equal(result, "Registrar missing".length);
	assert.deepEqual(fixture.runtime.logcat.snapshot()[0], {
		level: "W",
		message: "Registrar missing",
		sequence: 0,
		tag: "FirebaseApp"
	});
});

test("println maps Android priority onto bounded log levels", () => {
	const fixture = createFixture();
	const tag = createGuestString(fixture.runtime, "FirebaseInstallations");
	const message = createGuestString(fixture.runtime, "request");
	fixture.family.invoke(record("println", "(ILjava/lang/String;Ljava/lang/String;)I"), [6, tag, message]);
	assert.equal(fixture.runtime.logcat.snapshot()[0].level, "E");
});

test("isLoggable and getStackTraceString return guest values", () => {
	const fixture = createFixture();
	const throwable = fixture.runtime.heap.allocate("Ljava/lang/IllegalStateException;");
	assert.equal(fixture.family.invoke(record("isLoggable", "(Ljava/lang/String;I)Z"), [0, 3]), 1);
	const text = fixture.family.invoke(record("getStackTraceString", "(Ljava/lang/Throwable;)Ljava/lang/String;"), [throwable]);
	assert.equal(readGuestText(fixture.runtime, text), "Ljava/lang/IllegalStateException;");
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap, logcat: createAndroidLogcat() };
	return Object.freeze({
		family: createFrameworkAndroidTraceMethods(runtime),
		runtime
	});
}

function record(name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType: LOG, descriptor, name }),
		signature: `${LOG}->${name}${descriptor}`
	});
}
