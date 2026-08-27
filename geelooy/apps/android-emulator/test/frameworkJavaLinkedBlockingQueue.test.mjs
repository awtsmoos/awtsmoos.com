//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaConcurrentQueueMethods } from "../core/android/frameworkJavaConcurrentQueues.js";
import {
	initializeJavaList,
	javaListValues
} from "../core/android/frameworkJavaListStorage.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ARRAY_BLOCKING_QUEUE = "Ljava/util/concurrent/ArrayBlockingQueue;";
const LINKED_BLOCKING_QUEUE = "Ljava/util/concurrent/LinkedBlockingQueue;";

/**
 * Proves the measured LinkedBlockingQueue enters deterministic guest FIFO state.
 * The Awtsmoos renews head and tail; Awtsmoos.com keeps blocking, timing, and
 * host synchronization beyond the boundary until authentic execution asks.
 */
test("LinkedBlockingQueue constructs empty and preserves FIFO operations", () => {
	const fixture = createFixture();
	const first = fixture.object();
	const second = fixture.object();

	assert.equal(fixture.call("isEmpty", "()Z", [fixture.queue]), 1);
	assert.equal(fixture.call("offer", "(Ljava/lang/Object;)Z", [fixture.queue, first]), 1);
	assert.equal(fixture.call("add", "(Ljava/lang/Object;)Z", [fixture.queue, second]), 1);
	assert.equal(fixture.call("size", "()I", [fixture.queue]), 2);
	assert.equal(fixture.call("peek", "()Ljava/lang/Object;", [fixture.queue]), first);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.queue]), first);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.queue]), second);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.queue]), 0);
});

test("LinkedBlockingQueue copies collection order without aliasing", () => {
	const fixture = createFixture(false);
	const first = fixture.object();
	const second = fixture.object();
	const source = fixture.heap.allocate("Ljava/util/ArrayList;");
	initializeJavaList(fixture.runtime, source);
	javaListValues(fixture.runtime, source).push(first, second);

	fixture.call("<init>", "(Ljava/util/Collection;)V", [fixture.queue, source]);
	assert.deepEqual(javaListValues(fixture.runtime, fixture.queue), [first, second]);
	javaListValues(fixture.runtime, source).length = 0;
	assert.deepEqual(javaListValues(fixture.runtime, fixture.queue), [first, second]);
});

test("LinkedBlockingQueue refuses null and unmeasured blocking methods", () => {
	const fixture = createFixture();
	assert.throws(
		() => fixture.call("offer", "(Ljava/lang/Object;)Z", [fixture.queue, 0]),
		error => error.code === "ANDROID_CONCURRENT_QUEUE_NULL"
	);
	assert.throws(
		() => fixture.call("take", "()Ljava/lang/Object;", [fixture.queue]),
		error => error.code === "ANDROID_CONCURRENT_QUEUE_METHOD_UNSUPPORTED"
	);
	assert.equal(fixture.methods.canHandle(record(ARRAY_BLOCKING_QUEUE, "<init>", "()V")), false);
});

function createFixture(initialize = true) {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaConcurrentQueueMethods(runtime);
	const queue = heap.allocate(LINKED_BLOCKING_QUEUE);
	const call = (name, descriptor, args) => {
		return methods.invoke(record(LINKED_BLOCKING_QUEUE, name, descriptor), args);
	};
	assert.equal(methods.canHandle(record(LINKED_BLOCKING_QUEUE, "<init>", "()V")), true);
	if (initialize) call("<init>", "()V", [queue]);
	return Object.freeze({
		call,
		heap,
		methods,
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		queue,
		runtime
	});
}

function record(classType, name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType, descriptor, name }),
		signature: `${classType}->${name}${descriptor}`
	});
}
