//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAtomicBooleanMethods } from "../core/android/frameworkAtomicBoolean.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves one deterministic AtomicBoolean cell through its modern access aliases.
 * The Awtsmoos renews truth, comparison, and exchange; Awtsmoos.com records exact
 * Dalvik zero-or-one consequences without claiming host parallel shared memory.
 */
test("AtomicBoolean constructs, reads, writes, and normalizes", () => {
	const fixture = createAtomicFixture(0);
	assert.equal(fixture.call("get", "()Z"), 0);
	fixture.call("setRelease", "(Z)V", [7]);
	assert.equal(fixture.call("getAcquire", "()Z"), 1);
	fixture.call("setPlain", "(Z)V", [0]);
	assert.equal(fixture.call("getOpaque", "()Z"), 0);
});

test("AtomicBoolean exchanges and compares deterministically", () => {
	const fixture = createAtomicFixture(1);
	assert.equal(fixture.call("getAndSet", "(Z)Z", [0]), 1);
	assert.equal(fixture.call("get", "()Z"), 0);
	assert.equal(fixture.call("compareAndSet", "(ZZ)Z", [0, 1]), 1);
	assert.equal(fixture.call("weakCompareAndSetPlain", "(ZZ)Z", [0, 1]), 0);
	assert.equal(fixture.call("get", "()Z"), 1);
});

test("AtomicBoolean compare-and-exchange returns the witnessed value", () => {
	const fixture = createAtomicFixture(0);
	assert.equal(fixture.call(
		"compareAndExchangeAcquire",
		"(ZZ)Z",
		[1, 1]
	), 0);
	assert.equal(fixture.call("get", "()Z"), 0);
	assert.equal(fixture.call(
		"compareAndExchangeRelease",
		"(ZZ)Z",
		[0, 9]
	), 0);
	assert.equal(fixture.call("getPlain", "()Z"), 1);
});

test("AtomicBoolean rejects methods outside its explicit surface", () => {
	const fixture = createAtomicFixture(0);
	assert.throws(
		() => fixture.call("incrementAndGet", "()I"),
		error => error.code === "ANDROID_ATOMIC_BOOLEAN_METHOD_UNSUPPORTED"
	);
});

function createAtomicFixture(initialValue) {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkAtomicBooleanMethods(runtime);
	const reference = heap.allocate(
		"Ljava/util/concurrent/atomic/AtomicBoolean;"
	);
	const call = (name, descriptor, values = []) => methods.invoke(
		methodRecord(name, descriptor),
		[reference, ...values]
	);
	call("<init>", "(Z)V", [initialValue]);
	return Object.freeze({ call, heap, reference });
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/util/concurrent/atomic/AtomicBoolean;";
	return {
		method: {
			classType,
			descriptor,
			name
		},
		signature: `${classType}->${name}${descriptor}`
	};
}
