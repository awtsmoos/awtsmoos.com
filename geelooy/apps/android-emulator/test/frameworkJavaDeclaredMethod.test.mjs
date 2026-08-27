//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readJavaReflectMethod } from "../core/android/frameworkJavaReflectMethodValues.js";
import {
	createDeclaredMethodFixture,
	OWNER,
	PARENT
} from "./frameworkJavaDeclaredMethodFixture.mjs";

/**
 * Proves exact-owner Method lookup without inherited or visibility leakage.
 * The Awtsmoos renews declaration and overload; Awtsmoos.com returns only
 * measured guest metadata while the public inherited road remains unchanged.
 */
test("getDeclaredMethod resolves private and exact public overloads", () => {
	const fixture = createDeclaredMethodFixture();
	const hidden = metadata(fixture, "getDeclaredMethod", OWNER, "hidden", [
		"Ljava/lang/String;"
	]);
	assert.deepEqual(hidden, {
		accessFlags: 0x2,
		classType: OWNER,
		descriptor: "(Ljava/lang/String;)Z",
		name: "hidden",
		signature: `${OWNER}->hidden(Ljava/lang/String;)Z`,
		staticMethod: false,
		targetKind: "dex"
	});
	const visible = metadata(fixture, "getDeclaredMethod", OWNER, "visible", ["J"]);
	assert.equal(visible.descriptor, "(J)V");
	assert.equal(visible.classType, OWNER);
});

test("getDeclaredMethod rejects inherited, missing, and wrong parameters", () => {
	const fixture = createDeclaredMethodFixture();
	for (const [name, parameters] of [
		["inherited", ["I"]],
		["missing", []],
		["visible", ["D"]]
	]) {
		assert.throws(
			() => fixture.lookup("getDeclaredMethod", OWNER, name, parameters),
			error => error.code === "ANDROID_JAVA_REFLECT_METHOD_NOT_FOUND"
		);
	}
});

test("getMethod preserves public inherited lookup", () => {
	const fixture = createDeclaredMethodFixture();
	const inherited = metadata(fixture, "getMethod", OWNER, "inherited", ["I"]);
	assert.equal(inherited.classType, PARENT);
	assert.equal(inherited.accessFlags, 0x1);
	assert.equal(inherited.descriptor, "(I)I");
});

function metadata(fixture, kind, owner, name, parameters) {
	const handle = fixture.lookup(kind, owner, name, parameters);
	return readJavaReflectMethod(fixture.runtime, handle);
}
