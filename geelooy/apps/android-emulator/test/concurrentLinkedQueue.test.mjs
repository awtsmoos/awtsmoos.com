//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaConcurrentQueueMethods } from "../core/android/frameworkJavaConcurrentQueues.js";
import {
	initializeJavaList,
	javaListValues
} from "../core/android/frameworkJavaListStorage.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves deterministic FIFO queue behavior on shared collection storage. The
 * Awtsmoos creates head, tail, empty shore, and removal anew; Awtsmoos.com keeps
 * arbitrary APK queue contents visible to generic Java collection machinery.
 */
test("ConcurrentLinkedQueue preserves FIFO offer, peek, and poll", () => {
	const fixture = createQueueFixture();
	const first = fixture.object();
	const second = fixture.object();
	const third = fixture.object();
	fixture.offer(first);
	fixture.offer(second);
	fixture.offer(third);
	assert.equal(fixture.call("peek", "()Ljava/lang/Object;", [fixture.queue]), first);
	assert.equal(fixture.call("size", "()I", [fixture.queue]), 3);
	assert.equal(fixture.poll(), first);
	assert.equal(fixture.poll(), second);
	assert.equal(fixture.poll(), third);
	assert.equal(fixture.poll(), 0);
	assert.equal(fixture.call("isEmpty", "()Z", [fixture.queue]), 1);
});

test("ConcurrentLinkedQueue rejects null and reports empty heads", () => {
	const fixture = createQueueFixture();
	assert.throws(
		() => fixture.offer(0),
		error => error.code === "ANDROID_CONCURRENT_QUEUE_NULL"
	);
	assert.throws(
		() => fixture.call("element", "()Ljava/lang/Object;", [fixture.queue]),
		error => error.code === "ANDROID_CONCURRENT_QUEUE_EMPTY"
	);
	assert.throws(
		() => fixture.call("remove", "()Ljava/lang/Object;", [fixture.queue]),
		error => error.code === "ANDROID_CONCURRENT_QUEUE_EMPTY"
	);
});

test("ConcurrentLinkedQueue supports identity removal and clear", () => {
	const fixture = createQueueFixture();
	const first = fixture.object();
	const second = fixture.object();
	fixture.offer(first);
	fixture.offer(second);
	assert.equal(fixture.call(
		"contains",
		"(Ljava/lang/Object;)Z",
		[fixture.queue, second]
	), 1);
	assert.equal(fixture.call(
		"remove",
		"(Ljava/lang/Object;)Z",
		[fixture.queue, first]
	), 1);
	assert.deepEqual(javaListValues(fixture.runtime, fixture.queue), [second]);
	fixture.call("clear", "()V", [fixture.queue]);
	assert.deepEqual(javaListValues(fixture.runtime, fixture.queue), []);
});

test("ConcurrentLinkedQueue copies Collection order and adds all", () => {
	const fixture = createQueueFixture();
	const first = fixture.object();
	const second = fixture.object();
	const source = fixture.heap.allocate("Ljava/util/ArrayList;");
	initializeJavaList(fixture.runtime, source);
	javaListValues(fixture.runtime, source).push(first, second);
	const copied = fixture.heap.allocate(
		"Ljava/util/concurrent/ConcurrentLinkedQueue;"
	);
	fixture.call(
		"<init>",
		"(Ljava/util/Collection;)V",
		[copied, source]
	);
	assert.deepEqual(javaListValues(fixture.runtime, copied), [first, second]);
	assert.equal(fixture.call(
		"addAll",
		"(Ljava/util/Collection;)Z",
		[fixture.queue, copied]
	), 1);
	assert.deepEqual(javaListValues(fixture.runtime, fixture.queue), [first, second]);
});

function createQueueFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaConcurrentQueueMethods(runtime);
	const queue = heap.allocate(
		"Ljava/util/concurrent/ConcurrentLinkedQueue;"
	);
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	call("<init>", "()V", [queue]);
	return Object.freeze({
		call,
		heap,
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		offer(value) {
			return call("offer", "(Ljava/lang/Object;)Z", [queue, value]);
		},
		poll() {
			return call("poll", "()Ljava/lang/Object;", [queue]);
		},
		queue,
		runtime
	});
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/util/concurrent/ConcurrentLinkedQueue;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
