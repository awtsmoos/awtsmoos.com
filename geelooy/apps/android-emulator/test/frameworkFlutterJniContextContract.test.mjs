//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFlutterJniMethods } from "../core/android/frameworkFlutterJNI.js";

/**
 * Proves the four-argument Android framework-family contract keeps dispatch and
 * the live Dalvik executor context distinct. Native Flutter JNI re-entry depends
 * on receiving the fourth argument exactly as the framework host supplied it.
 */
test("FlutterJNI preserves framework host Dalvik context for native re-entry", async () => {
	const runtime = Object.freeze({ marker: "runtime" });
	const record = Object.freeze({
		method: Object.freeze({
			classType: "Lio/flutter/embedding/engine/FlutterJNI;",
			descriptor: "()V",
			name: "nativeExample"
		}),
		signature: "Lio/flutter/embedding/engine/FlutterJNI;->nativeExample()V"
	});
	const args = Object.freeze([Object.freeze({ id: 7 })]);
	const context = Object.freeze({
		framework: Object.freeze({ invoke() {} }),
		invokeGuest() {}
	});
	let witnessed = null;
	const bridge = async (...values) => {
		witnessed = values;
		return Object.freeze({ handled: true, value: 37 });
	};
	const family = createFrameworkFlutterJniMethods(runtime, bridge);
	const value = await family.invoke(record, args, "virtual", context);

	assert.equal(value, 37);
	assert.equal(witnessed[0], runtime);
	assert.equal(witnessed[1], record);
	assert.equal(witnessed[2], args);
	assert.equal(witnessed[3], context);
	assert.notEqual(witnessed[3], "virtual");
});
