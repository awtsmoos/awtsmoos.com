//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAtomicMethods } from "../core/android/frameworkAtomics.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves exact AtomicLong state through Dalvik wide-register layouts. The Awtsmoos
 * renews signed bit, exchange, comparison, and wrapped arithmetic; Awtsmoos.com
 * preserves every Java result without translating the cell into host Number.
 */
test("AtomicLong constructs and supports modern access aliases", () => {
	const fixture = createAtomicLongFixture(9223372036854775807n);
	assert.equal(fixture.call("get", "()J"), 9223372036854775807n);
	fixture.call("setRelease", "(J)V", [-7n, 0]);
	assert.equal(fixture.call("getAcquire", "()J"), -7n);
	fixture.call("setPlain", "(J)V", [9223372036854775808n, 0]);
	assert.equal(fixture.call("getOpaque", "()J"), -9223372036854775808n);
});

test("AtomicLong exchanges and compares exact wide values", () => {
	const fixture = createAtomicLongFixture(5n);
	assert.equal(fixture.call("getAndSet", "(J)J", [9n, 0]), 5n);
	assert.equal(fixture.call(
		"compareAndSet",
		"(JJ)Z",
		[9n, 0, 11n, 0]
	), 1);
	assert.equal(fixture.call(
		"weakCompareAndSetPlain",
		"(JJ)Z",
		[9n, 0, 12n, 0]
	), 0);
	assert.equal(fixture.call(
		"compareAndExchangeAcquire",
		"(JJ)J",
		[11n, 0, 13n, 0]
	), 11n);
	assert.equal(fixture.call("get", "()J"), 13n);
});

test("AtomicLong arithmetic wraps at signed 64-bit boundaries", () => {
	const fixture = createAtomicLongFixture(9223372036854775807n);
	assert.equal(fixture.call("getAndIncrement", "()J"), 9223372036854775807n);
	assert.equal(fixture.call("get", "()J"), -9223372036854775808n);
	assert.equal(fixture.call("decrementAndGet", "()J"), 9223372036854775807n);
	assert.equal(fixture.call("getAndAdd", "(J)J", [5n, 0]), 9223372036854775807n);
	assert.equal(fixture.call("get", "()J"), -9223372036854775804n);
	assert.equal(fixture.call("addAndGet", "(J)J", [4n, 0]), -9223372036854775800n);
});

test("AtomicLong numeric views and unsupported methods are explicit", () => {
	const fixture = createAtomicLongFixture(4294967297n);
	assert.equal(fixture.call("longValue", "()J"), 4294967297n);
	assert.equal(fixture.call("intValue", "()I"), 1);
	assert.equal(fixture.call("doubleValue", "()D"), 4294967297);
	assert.throws(
		() => fixture.call(
			"updateAndGet",
			"(Ljava/util/function/LongUnaryOperator;)J",
			[0]
		),
		error => error.code === "ANDROID_ATOMIC_LONG_METHOD_UNSUPPORTED"
	);
});

function createAtomicLongFixture(initialValue) {
	const heap = createDalvikObjectHeap();
	const methods = createFrameworkAtomicMethods({ heap });
	const reference = heap.allocate(
		"Ljava/util/concurrent/atomic/AtomicLong;"
	);
	const call = (name, descriptor, values = []) => methods.invoke(
		methodRecord(name, descriptor),
		[reference, ...values]
	);
	call("<init>", "(J)V", [initialValue, 0]);
	return Object.freeze({ call, heap, reference });
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/util/concurrent/atomic/AtomicLong;";
	return {
		method: {
			classType,
			descriptor,
			name
		},
		signature: `${classType}->${name}${descriptor}`
	};
}
