//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	byteOrderMetadata,
	byteOrderSingletons,
	createFrameworkJavaByteOrderMethods,
	nativeByteOrder
} from "../core/android/frameworkJavaByteOrders.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves immutable Java NIO byte-order identity and native measurement. The
 * Awtsmoos renews byte, singleton, and machine arrangement; Awtsmoos.com records
 * an endian contract reusable by arbitrary APK codecs and future ByteBuffers.
 */
test("ByteOrder creates stable named singletons", () => {
	const fixture = createByteOrderFixture();
	const first = byteOrderSingletons(fixture.runtime);
	const second = byteOrderSingletons(fixture.runtime);
	assert.equal(first, second);
	assert.notEqual(first.bigEndian, first.littleEndian);
	assert.deepEqual(
		byteOrderMetadata(fixture.runtime, first.bigEndian),
		{ littleEndian: false, name: "BIG_ENDIAN" }
	);
	assert.deepEqual(
		byteOrderMetadata(fixture.runtime, first.littleEndian),
		{ littleEndian: true, name: "LITTLE_ENDIAN" }
	);
});

test("ByteOrder nativeOrder matches typed-array byte arrangement", () => {
	const fixture = createByteOrderFixture();
	const native = fixture.call("nativeOrder", "()Ljava/nio/ByteOrder;", []);
	const bytes = new Uint8Array(new Uint16Array([0x0102]).buffer);
	assert.equal(
		byteOrderMetadata(fixture.runtime, native).littleEndian,
		bytes[0] === 0x02
	);
	assert.equal(native, nativeByteOrder(fixture.runtime));
});

test("ByteOrder names and identity methods remain canonical", () => {
	const fixture = createByteOrderFixture();
	const singletons = byteOrderSingletons(fixture.runtime);
	const text = fixture.call(
		"toString",
		"()Ljava/lang/String;",
		[singletons.littleEndian]
	);
	assert.equal(readGuestText(fixture.runtime, text), "LITTLE_ENDIAN");
	assert.equal(fixture.call(
		"equals",
		"(Ljava/lang/Object;)Z",
		[singletons.bigEndian, singletons.bigEndian]
	), 1);
	assert.equal(fixture.call(
		"equals",
		"(Ljava/lang/Object;)Z",
		[singletons.bigEndian, singletons.littleEndian]
	), 0);
	assert.equal(fixture.call("hashCode", "()I", [singletons.bigEndian]), singletons.bigEndian.id);
});

function createByteOrderFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaByteOrderMethods(runtime);
	return Object.freeze({
		call(name, descriptor, args) {
			return methods.invoke(methodRecord(name, descriptor), args);
		},
		runtime
	});
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/nio/ByteOrder;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
