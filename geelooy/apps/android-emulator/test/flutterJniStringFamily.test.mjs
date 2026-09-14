//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { jniNativeInterfaceSlotName } from "../core/native/jniNativeInterfaceNames.js";
import {
	createStringFamilyFixture,
	RETURN_ADDRESS,
	THREAD_KEY
} from "./flutterJniStringFamilyFixture.mjs";

const MUTF8_SAMPLE = Object.freeze([
	0x41,
	0xc0,
	0x80,
	0xed,
	0xa0,
	0xbd,
	0xed,
	0xb8,
	0x80,
	0x42,
	0x00
]);

/** Proves JNI modified UTF-8 construction, length, copy, and release semantics. */
test("JNI modified UTF-8 string family preserves Java code units", () => {
	const fixture = createStringFamilyFixture();
	const source = fixture.writeBytes(MUTF8_SAMPLE);
	fixture.invoke("NewStringUTF", [source]);
	const handle = fixture.registers.read(0, 64, "zero");
	const reference = fixture.readReference(handle);
	assert.equal(reference.target, "A\0😀B");
	assert.equal(reference.metadata.scope, "local");
	assert.equal(reference.metadata.operation, "NewStringUTF");
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	fixture.invoke("GetStringUTFLength", [handle]);
	assert.equal(fixture.registers.read(0, 32, "zero"), 10n);
	const isCopy = fixture.writeBytes([0]);
	const acquired = fixture.invoke("GetStringUTFChars", [handle, isCopy]);
	const pointer = BigInt(acquired.result.pointer);
	assert.deepEqual([...fixture.heap.read(pointer, MUTF8_SAMPLE.length)], MUTF8_SAMPLE);
	assert.equal(fixture.heap.read(isCopy, 1)[0], 1);
	fixture.invoke("ReleaseStringUTFChars", [handle, pointer]);
	assert.throws(
		() => fixture.invoke("ReleaseStringUTFChars", [handle, pointer]),
		error => error.code === "JNI_STRING_UTF_POINTER"
	);
	assert.equal(reference.handle, handle);
	assert.equal(THREAD_KEY, 0x12345000n);
});

/** Proves UTF-16 and modified-UTF-8 region operations preserve surrogate units. */
test("JNI string regions copy exact selected code units", () => {
	const fixture = createStringFamilyFixture();
	const handle = fixture.addString("A😀B");
	const utf16 = fixture.writeBytes([0, 0, 0, 0]);
	fixture.invoke("GetStringRegion", [handle, 1, 2, utf16]);
	assert.deepEqual([...fixture.heap.read(utf16, 4)], [0x3d, 0xd8, 0x00, 0xde]);
	const mutf8 = fixture.writeBytes([0, 0, 0, 0, 0, 0]);
	fixture.invoke("GetStringUTFRegion", [handle, 1, 2, mutf8]);
	assert.deepEqual(
		[...fixture.heap.read(mutf8, 6)],
		[0xed, 0xa0, 0xbd, 0xed, 0xb8, 0x80]
	);
});

/** Proves critical copies use guest memory and malformed ordinary UTF-8 is rejected. */
test("JNI string critical access and MUTF-8 validation stay bounded", () => {
	const fixture = createStringFamilyFixture();
	const handle = fixture.addString("A😀B");
	const copyFlag = fixture.writeBytes([0]);
	const acquired = fixture.invoke("GetStringCritical", [handle, copyFlag]);
	const pointer = BigInt(acquired.result.pointer);
	assert.deepEqual(
		[...fixture.heap.read(pointer, 8)],
		[0x41, 0x00, 0x3d, 0xd8, 0x00, 0xde, 0x42, 0x00]
	);
	assert.equal(fixture.heap.read(copyFlag, 1)[0], 1);
	fixture.invoke("ReleaseStringCritical", [handle, pointer]);
	const ordinaryUtf8 = fixture.writeBytes([0xf0, 0x9f, 0x98, 0x80, 0x00]);
	assert.throws(
		() => fixture.invoke("NewStringUTF", [ordinaryUtf8]),
		error => error.code === "JNI_MUTF8_LEAD_BYTE"
	);
});
test("JNI string family occupies the canonical Android interface slots", () => {
	const expected = new Map([
		[163, "NewString"],
		[164, "GetStringLength"],
		[165, "GetStringChars"],
		[166, "ReleaseStringChars"],
		[167, "NewStringUTF"],
		[168, "GetStringUTFLength"],
		[169, "GetStringUTFChars"],
		[170, "ReleaseStringUTFChars"],
		[220, "GetStringRegion"],
		[221, "GetStringUTFRegion"],
		[224, "GetStringCritical"],
		[225, "ReleaseStringCritical"]
	]);
	for (const [slot, name] of expected) {
		assert.equal(jniNativeInterfaceSlotName(slot), name);
	}
});
