//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaConcurrentQueueMethods } from "../core/android/frameworkJavaConcurrentQueues.js";
import { createFrameworkJavaIteratorMethods } from "../core/android/frameworkJavaIterators.js";
import {
	initializeJavaList,
	javaListValues
} from "../core/android/frameworkJavaListStorage.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves the bounded guest deque where front and rear are recreated each instant.
 * The Awtsmoos turns queue into stack without changing the vessel; Awtsmoos.com
 * keeps null, empty, copying, and iteration boundaries explicit for authentic DEX.
 */
test("ArrayDeque preserves front, rear, and FIFO order", () => {
	const fixture = createDequeFixture();
	const first = fixture.object();
	const second = fixture.object();
	const front = fixture.object();
	fixture.call("addLast", "(Ljava/lang/Object;)V", [fixture.deque, first]);
	fixture.call("offerLast", "(Ljava/lang/Object;)Z", [fixture.deque, second]);
	fixture.call("addFirst", "(Ljava/lang/Object;)V", [fixture.deque, front]);
	assert.equal(fixture.call("getFirst", "()Ljava/lang/Object;", [fixture.deque]), front);
	assert.equal(fixture.call("getLast", "()Ljava/lang/Object;", [fixture.deque]), second);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.deque]), front);
	assert.equal(fixture.call("pollLast", "()Ljava/lang/Object;", [fixture.deque]), second);
	assert.equal(fixture.call("pollFirst", "()Ljava/lang/Object;", [fixture.deque]), first);
	assert.equal(fixture.call("poll", "()Ljava/lang/Object;", [fixture.deque]), 0);
});

test("ArrayDeque supports stack order and explicit empty errors", () => {
	const fixture = createDequeFixture();
	const first = fixture.object();
	const second = fixture.object();
	fixture.call("push", "(Ljava/lang/Object;)V", [fixture.deque, first]);
	fixture.call("push", "(Ljava/lang/Object;)V", [fixture.deque, second]);
	assert.equal(fixture.call("pop", "()Ljava/lang/Object;", [fixture.deque]), second);
	assert.equal(fixture.call("pop", "()Ljava/lang/Object;", [fixture.deque]), first);
	assert.throws(
		() => fixture.call("offer", "(Ljava/lang/Object;)Z", [fixture.deque, 0]),
		error => error.code === "ANDROID_ARRAY_DEQUE_NULL"
	);
	assert.throws(
		() => fixture.call("removeFirst", "()Ljava/lang/Object;", [fixture.deque]),
		error => error.code === "ANDROID_ARRAY_DEQUE_EMPTY"
	);
});

test("ArrayDeque copies collections and exposes generic iteration", () => {
	const fixture = createDequeFixture(false);
	const first = fixture.object();
	const second = fixture.object();
	const source = fixture.heap.allocate("Ljava/util/ArrayList;");
	initializeJavaList(fixture.runtime, source);
	javaListValues(fixture.runtime, source).push(first, second);
	fixture.call("<init>", "(Ljava/util/Collection;)V", [fixture.deque, source]);
	assert.equal(fixture.call("contains", "(Ljava/lang/Object;)Z", [fixture.deque, second]), 1);
	assert.equal(fixture.call("removeLastOccurrence", "(Ljava/lang/Object;)Z", [fixture.deque, second]), 1);
	const iterator = fixture.call("iterator", "()Ljava/util/Iterator;", [fixture.deque]);
	assert.equal(fixture.iterator("hasNext", "()Z", [iterator]), 1);
	assert.equal(fixture.iterator("next", "()Ljava/lang/Object;", [iterator]), first);
	assert.deepEqual(javaListValues(fixture.runtime, fixture.deque), [first]);
});

function createDequeFixture(initialize = true) {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaConcurrentQueueMethods(runtime);
	const iterators = createFrameworkJavaIteratorMethods(runtime);
	const deque = heap.allocate("Ljava/util/ArrayDeque;");
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord("Ljava/util/ArrayDeque;", name, descriptor),
		args
	);
	if (initialize) call("<init>", "()V", [deque]);
	return Object.freeze({
		call,
		deque,
		heap,
		iterator(name, descriptor, args) {
			return iterators.invoke(methodRecord("Ljava/util/Iterator;", name, descriptor), args);
		},
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		runtime
	});
}

function methodRecord(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
