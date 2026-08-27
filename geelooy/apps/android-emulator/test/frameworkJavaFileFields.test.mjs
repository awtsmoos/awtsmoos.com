//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	frameworkDeclaredFields,
	initializeFrameworkStaticField,
	seedFrameworkStaticFields
} from "../core/android/frameworkJavaFrameworkFields.js";
import { JAVA_FILE } from "../core/android/frameworkJavaFileFields.js";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

test("File.separator seeds one stable slash String", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const fields = frameworkDeclaredFields(JAVA_FILE);
	assert.equal(fields.length, 1);
	const separator = fields[0];
	assert.equal(separator.signature, "Ljava/io/File;->separator:Ljava/lang/String;");
	assert.equal(separator.accessFlags, 0x19);
	const staticFields = new Map();
	seedFrameworkStaticFields(runtime, staticFields);
	const first = staticFields.get(separator.signature);
	assert.equal(readJavaText(runtime, first), "/");
	seedFrameworkStaticFields(runtime, staticFields);
	assert.equal(staticFields.get(separator.signature), first);
});

test("File initializer rejects unrelated framework metadata", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	assert.deepEqual(
		initializeFrameworkStaticField(runtime, {
			frameworkInitializer: "java-file-missing"
		}),
		{ supported: false, value: 0 }
	);
});
