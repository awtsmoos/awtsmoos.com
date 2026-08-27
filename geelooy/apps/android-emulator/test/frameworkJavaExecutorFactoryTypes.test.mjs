//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaExecutorMethods } from "../core/android/frameworkJavaExecutors.js";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import {
	JAVA_SCHEDULED_THREAD_POOL_EXECUTOR,
	JAVA_THREAD_POOL_EXECUTOR,
	executorTypeForFactory
} from "../core/android/frameworkJavaExecutorTypes.js";
import { checkDalvikCast } from "../core/dalvik/operations/objectTypeChecks.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const EXECUTORS = "Ljava/util/concurrent/Executors;";
const EXECUTOR_SERVICE = "Ljava/util/concurrent/ExecutorService;";
const SCHEDULED_EXECUTOR_SERVICE = "Ljava/util/concurrent/ScheduledExecutorService;";
const THREAD_FACTORY = "Ljava/util/concurrent/ThreadFactory;";
const EMPTY_REGISTRY = Object.freeze({
	classDefinition() {
		return null;
	},
	superType() {
		return null;
	}
});

/**
 * Proves authentic Executors factories allocate cast-correct concrete guest types.
 * The Awtsmoos recreates promise, implementation, ancestry, and cast anew;
 * Awtsmoos.com grants scheduled identity only to the scheduled factory road.
 */
test("single-thread scheduled factory survives the authentic PC 334 cast", async () => {
	const fixture = createFixture();
	const method = record(
		"newSingleThreadScheduledExecutor",
		`(${THREAD_FACTORY})${SCHEDULED_EXECUTOR_SERVICE}`
	);
	const executor = await fixture.family.invoke(method, [fixture.factory]);
	assert.equal(fixture.heap.get(executor).type, JAVA_SCHEDULED_THREAD_POOL_EXECUTOR);
	assert.doesNotThrow(() => checkDalvikCast(
		executor,
		SCHEDULED_EXECUTOR_SERVICE,
		fixture.context,
		{ a: 2, pc: 334 }
	));
});

test("ordinary fixed pools remain non-scheduled executor services", async () => {
	const fixture = createFixture();
	const method = record(
		"newFixedThreadPool",
		`(I${THREAD_FACTORY})${EXECUTOR_SERVICE}`
	);
	const executor = await fixture.family.invoke(method, [4, fixture.factory]);
	assert.equal(fixture.heap.get(executor).type, JAVA_THREAD_POOL_EXECUTOR);
	assert.doesNotThrow(() => checkDalvikCast(
		executor,
		EXECUTOR_SERVICE,
		fixture.context,
		{ a: 0, pc: 310 }
	));
	assert.throws(
		() => checkDalvikCast(
			executor,
			SCHEDULED_EXECUTOR_SERVICE,
			fixture.context,
			{ a: 2, pc: 334 }
		),
		error => error.code === "DALVIK_CLASS_CAST"
	);
});

test("both scheduled factory names select the scheduled concrete type", () => {
	for (const name of [
		"newSingleThreadScheduledExecutor",
		"newScheduledThreadPool"
	]) {
		assert.equal(
			executorTypeForFactory(record(name, "()Ljava/lang/Object;")),
			JAVA_SCHEDULED_THREAD_POOL_EXECUTOR
		);
	}
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = Object.freeze({ heap, registry: EMPTY_REGISTRY });
	const framework = Object.freeze({
		isAssignable(actualType, expectedType) {
			return isClassAssignable(runtime, expectedType, actualType);
		},
		isInstance() {
			return false;
		}
	});
	return Object.freeze({
		context: Object.freeze({ framework, heap }),
		factory: heap.allocate("LT1/a;"),
		family: createFrameworkJavaExecutorMethods(runtime),
		heap
	});
}

function record(name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType: EXECUTORS, descriptor, name }),
		signature: `${EXECUTORS}->${name}${descriptor}`
	});
}
