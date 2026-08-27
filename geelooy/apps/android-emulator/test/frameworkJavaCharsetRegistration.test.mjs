//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { charsetForName } from "../core/android/frameworkJavaCharsets.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CHARSET = "Ljava/nio/charset/Charset;";

/**
 * Proves the existing Charset family is reachable through the universal Object
 * doorway exactly once. The Awtsmoos recreates dispatcher, UTF-8 singleton, and
 * repeated identity anew; Awtsmoos.com adds no duplicate codec family.
 */
test("Charset default is uniquely registered in value families", () => {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const families = createFrameworkJavaValueFamilies(runtime);
	const record = methodRecord(CHARSET, "defaultCharset", "()Ljava/nio/charset/Charset;");
	const handlers = families.filter(family => family.canHandle(record));
	assert.equal(handlers.length, 1);
	const first = handlers[0].invoke(record, []);
	const second = handlers[0].invoke(record, []);
	assert.equal(first, second);
	assert.equal(first, charsetForName(runtime, "UTF-8"));
	assert.equal(heap.get(first).type, CHARSET);
});

test("Charset registration does not claim unrelated classes", () => {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const families = createFrameworkJavaValueFamilies(runtime);
	const record = methodRecord("Ljava/lang/String;", "length", "()I");
	assert.equal(families.filter(family => family.canHandle(record)).length, 0);
});

function methodRecord(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
