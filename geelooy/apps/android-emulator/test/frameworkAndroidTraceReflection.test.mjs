//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { snapshotAndroidTrace } from "../core/android/frameworkAndroidTrace.js";
import { readJavaReflectMethod } from "../core/android/frameworkJavaReflectMethodValues.js";
import { createGuestString } from "../core/android/guestText.js";
import { createReflectMethodFixture } from "./frameworkJavaReflectMethodFixture.mjs";

const STRING = "Ljava/lang/String;";

/**
 * Reproduces the Run 24 reflection road used by Flutter's tracing bridge.
 * The test resolves a real framework Method, invokes it through Java reflection,
 * and verifies only virtual Android trace testimony changes.
 */
test("Trace asyncTraceBegin reflects and invokes with exact tagged signature", async () => {
	const fixture = createReflectMethodFixture();
	const method = fixture.getMethod(
		fixture.traceClass,
		"asyncTraceBegin",
		["J", STRING, "I"]
	);
	const metadata = readJavaReflectMethod(fixture.runtime, method);
	assert.equal(metadata.descriptor, "(JLjava/lang/String;I)V");
	assert.equal(metadata.staticMethod, true);
	assert.equal(metadata.targetKind, "framework");
	await fixture.invoke(method, 0, [
		fixture.boxedLong(4096n),
		createGuestString(fixture.runtime, "flutter/isolate"),
		fixture.boxedInteger(17)
	]);
	assert.deepEqual(snapshotAndroidTrace(fixture.runtime).events, [{
		cookie: 17,
		kind: "async-begin-tagged",
		name: "flutter/isolate",
		tag: "4096"
	}]);
});

test("Trace neighboring tagged methods are all reflectable", () => {
	const fixture = createReflectMethodFixture();
	const signatures = [
		["asyncTraceEnd", ["J", STRING, "I"]],
		["traceBegin", ["J", STRING]],
		["traceEnd", ["J"]],
		["traceCounter", ["J", STRING, "I"]],
		["setCounter", [STRING, "J"]]
	];
	for (const [name, parameters] of signatures) {
		const method = fixture.getMethod(fixture.traceClass, name, parameters);
		const metadata = readJavaReflectMethod(fixture.runtime, method);
		assert.equal(metadata.name, name);
		assert.equal(metadata.targetKind, "framework");
	}
});
