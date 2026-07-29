//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { appendBuilderValue } from "../core/android/frameworkJavaStringBuilderAppend.js";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

test("StringBuilder primitive append distinguishes zero from null", () => {
	for (const [descriptor, value, expected] of [
		["(I)Ljava/lang/StringBuilder;", 0, "0"],
		["(I)Ljava/lang/StringBuilder;", -7, "-7"],
		["(Z)Ljava/lang/StringBuilder;", 0, "false"],
		["(Z)Ljava/lang/StringBuilder;", 1, "true"],
		["(J)Ljava/lang/StringBuilder;", 9n, "9"],
		["(D)Ljava/lang/StringBuilder;", 4611686018427387904n, "2"]
	]) {
		const runtime = { heap: createDalvikObjectHeap() };
		const builder = runtime.heap.allocate("Ljava/lang/StringBuilder;", {
			"java:string": "prefix="
		});
		appendBuilderValue(runtime, record(descriptor), [builder, value], "prefix=");
		assert.equal(readJavaText(runtime, builder), `prefix=${expected}`);
	}
});

test("StringBuilder object null retains Java null text", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const builder = runtime.heap.allocate("Ljava/lang/StringBuilder;", {
		"java:string": "value="
	});
	appendBuilderValue(
		runtime,
		record("(Ljava/lang/Object;)Ljava/lang/StringBuilder;"),
		[builder, 0],
		"value="
	);
	assert.equal(readJavaText(runtime, builder), "value=null");
});

function record(descriptor) {
	return Object.freeze({ method: Object.freeze({ descriptor }) });
}
