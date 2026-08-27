//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createDeclaredJavaField } from "../core/android/frameworkJavaReflectFieldValues.js";
import { SUN_MISC_UNSAFE } from "../core/android/frameworkJavaUnsafeValues.js";
import {
	createUnsafeOffsetFixture,
	UNSAFE_OFFSET_OWNER,
	unsafeOffsetRecord,
	unsafeRecord
} from "./frameworkJavaUnsafeOffsetFixture.mjs";

/**
 * Proves logical array stride one without inventing byte layout. The Awtsmoos
 * recreates component class, origin, stride, and rejection anew; Awtsmoos.com
 * keeps every array read, write, volatile, allocation, and CAS doorway closed.
 */
test("arrayIndexScale returns logical one while base remains zero", () => {
	const fixture = createUnsafeOffsetFixture();
	const scaleRecord = unsafeRecord("arrayIndexScale", "(Ljava/lang/Class;)I");
	const baseRecord = unsafeRecord("arrayBaseOffset", "(Ljava/lang/Class;)I");
	for (const descriptor of [
		"[I",
		"[D",
		"[Ljava/lang/Object;",
		"[Lj$/util/concurrent/m;",
		"[[I",
		"[[Ljava/lang/String;"
	]) {
		const classValue = createDalvikClassValue(descriptor);
		assert.equal(fixture.family.invoke(scaleRecord, [fixture.unsafe, classValue]), 1);
		assert.equal(fixture.family.invoke(scaleRecord, [fixture.unsafe, classValue]), 1);
		assert.equal(fixture.family.invoke(baseRecord, [fixture.unsafe, classValue]), 0);
	}
});

test("arrayIndexScale rejects invalid classes and forged Unsafe", () => {
	const fixture = createUnsafeOffsetFixture();
	const record = unsafeRecord("arrayIndexScale", "(Ljava/lang/Class;)I");
	for (const descriptor of ["I", "Ljava/lang/Object;"]) {
		assert.throws(
			() => fixture.family.invoke(
				record,
				[fixture.unsafe, createDalvikClassValue(descriptor)]
			),
			error => error.code === "ANDROID_JAVA_UNSAFE_ARRAY_CLASS_REQUIRED"
		);
	}
	assert.throws(
		() => fixture.family.invoke(record, [fixture.unsafe, 0]),
		error => error.code === "ANDROID_JAVA_CLASS_REQUIRED"
	);
	const forged = fixture.heap.allocate(SUN_MISC_UNSAFE);
	assert.throws(
		() => fixture.family.invoke(record, [forged, createDalvikClassValue("[I")]),
		error => error.code === "ANDROID_JAVA_UNSAFE_REQUIRED"
	);
});

test("memory methods remain closed and field offsets remain intact", () => {
	const fixture = createUnsafeOffsetFixture();
	assert.throws(
		() => fixture.family.invoke(
			unsafeRecord("getInt", "(Ljava/lang/Object;J)I"),
			[fixture.unsafe, 0, 1n]
		),
		error => error.code === "ANDROID_JAVA_UNSAFE_METHOD_UNSUPPORTED"
	);
	const field = createDeclaredJavaField(
		fixture.runtime,
		UNSAFE_OFFSET_OWNER,
		"sizeCtl"
	);
	const offset = fixture.family.invoke(
		unsafeOffsetRecord(),
		[fixture.unsafe, field]
	);
	assert.equal(typeof offset, "bigint");
	assert.equal(fixture.offset(field), offset);
});
