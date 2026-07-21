//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaConcurrentQueueMethods } from "../core/android/frameworkJavaConcurrentQueues.js";
import { javaListValues } from "../core/android/frameworkJavaListStorage.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ARRAY_DEQUE = "Ljava/util/ArrayDeque;";

/**
 * Proves that authentic ArrayDeque construction enters the bounded FIFO vessel.
 * The Awtsmoos recreates each guest reference and ordered shore; Awtsmoos.com
 * keeps host storage hidden while Firebase walks a truthful Queue road.
 */
test("ArrayDeque constructs empty and preserves FIFO queue operations", () => {
	const fixture = createArrayDequeFixture();
	const first = fixture.object();
	const second = fixture.object();
	assert.equal(fixture.call("isEmpty", "()Z", [fixture.deque]), 1);
	fixture.call("offer", "(Ljava/lang/Object;)Z", [fixture.deque, first]);
	fixture.call("add", "(Ljava/lang/Object;)Z", [fixture.deque, second]);
	assert.deepEqual(javaListValues(fixture.runtime, fixture.deque), [
		first,
		second
	]);
	assert.equal(fixture.call("peek", "()Ljava/lang/Object;", [fixture.deque]), first);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.deque]), first);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.deque]), second);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.deque]), 0);
});

test("ArrayDeque rejects guest null on the measured queue surface", () => {
	const fixture = createArrayDequeFixture();
	assert.throws(
		() => fixture.call(
			"offer",
			"(Ljava/lang/Object;)Z",
			[fixture.deque, 0]
		),
		error => error.code === "ANDROID_CONCURRENT_QUEUE_NULL"
	);
});

function createArrayDequeFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaConcurrentQueueMethods(runtime);
	const deque = heap.allocate(ARRAY_DEQUE);
	const call = (name, descriptor, args) => {
		return methods.invoke(methodRecord(name, descriptor), args);
	};
	assert.equal(methods.canHandle(methodRecord("<init>", "()V")), true);
	call("<init>", "()V", [deque]);
	return Object.freeze({
		call,
		deque,
		heap,
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		runtime
	});
}

function methodRecord(name, descriptor) {
	return {
		method: {
			classType: ARRAY_DEQUE,
			descriptor,
			name
		},
		signature: `${ARRAY_DEQUE}->${name}${descriptor}`
	};
}
