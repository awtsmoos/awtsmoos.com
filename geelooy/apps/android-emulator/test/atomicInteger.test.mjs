//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAtomicMethods } from "../core/android/frameworkAtomics.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves signed-32-bit AtomicInteger behavior. The Awtsmoos renews value,
 * exchange, comparison, and wraparound; Awtsmoos.com records deterministic Java
 * outcomes without claiming browser shared-memory lock-free execution.
 */
test("AtomicInteger constructs and supports access aliases", () => {
	const fixture = createAtomicIntegerFixture(2147483647);
	assert.equal(fixture.call("get", "()I"), 2147483647);
	fixture.call("setRelease", "(I)V", [-7]);
	assert.equal(fixture.call("getAcquire", "()I"), -7);
	fixture.call("setPlain", "(I)V", [4294967295]);
	assert.equal(fixture.call("getOpaque", "()I"), -1);
});

test("AtomicInteger exchanges and compares", () => {
	const fixture = createAtomicIntegerFixture(5);
	assert.equal(fixture.call("getAndSet", "(I)I", [9]), 5);
	assert.equal(fixture.call("compareAndSet", "(II)Z", [9, 11]), 1);
	assert.equal(fixture.call("weakCompareAndSetPlain", "(II)Z", [9, 12]), 0);
	assert.equal(fixture.call("compareAndExchangeAcquire", "(II)I", [11, 13]), 11);
	assert.equal(fixture.call("get", "()I"), 13);
});

test("AtomicInteger arithmetic wraps at signed boundaries", () => {
	const fixture = createAtomicIntegerFixture(2147483647);
	assert.equal(fixture.call("getAndIncrement", "()I"), 2147483647);
	assert.equal(fixture.call("get", "()I"), -2147483648);
	assert.equal(fixture.call("decrementAndGet", "()I"), 2147483647);
	assert.equal(fixture.call("getAndAdd", "(I)I", [5]), 2147483647);
	assert.equal(fixture.call("addAndGet", "(I)I", [4]), -2147483640);
});

test("AtomicInteger exposes numeric views and text", () => {
	const fixture = createAtomicIntegerFixture(4294967297);
	assert.equal(fixture.call("intValue", "()I"), 1);
	assert.equal(fixture.call("longValue", "()J"), 1n);
	assert.equal(fixture.call("doubleValue", "()D"), 1);
	const text = fixture.call("toString", "()Ljava/lang/String;");
	assert.equal(readGuestText(fixture.runtime, text), "1");
});

function createAtomicIntegerFixture(initialValue) {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkAtomicMethods(runtime);
	const reference = heap.allocate(
		"Ljava/util/concurrent/atomic/AtomicInteger;"
	);
	const call = (name, descriptor, values = []) => methods.invoke(
		methodRecord(name, descriptor),
		[reference, ...values]
	);
	call("<init>", "(I)V", [initialValue]);
	return Object.freeze({ call, runtime });
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/util/concurrent/atomic/AtomicInteger;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
