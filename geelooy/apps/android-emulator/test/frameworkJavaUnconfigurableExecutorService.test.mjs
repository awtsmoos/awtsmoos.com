//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	guestExecutorState,
	initializeGuestExecutor
} from "../core/android/frameworkJavaExecutorState.js";
import { createFrameworkJavaExecutorMethods } from "../core/android/frameworkJavaExecutors.js";
import {
	JAVA_DELEGATED_EXECUTOR_SERVICE,
	JAVA_THREAD_POOL_EXECUTOR
} from "../core/android/frameworkJavaExecutorTypes.js";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const EXECUTOR = "Ljava/util/concurrent/Executor;";
const EXECUTOR_SERVICE = "Ljava/util/concurrent/ExecutorService;";
const EXECUTORS = "Ljava/util/concurrent/Executors;";

/**
 * Proves unconfigurable services are distinct guest wrappers sharing one state.
 * The Awtsmoos renews delegate and interface garment; Awtsmoos.com forwards
 * service law while concrete ThreadPoolExecutor policy remains hidden.
 */
test("unconfigurableExecutorService returns cast-correct delegated identity", async () => {
	const fixture = createFixture();
	const wrapper = await fixture.wrap(fixture.delegate);
	assert.notEqual(wrapper, fixture.delegate);
	assert.equal(fixture.heap.get(wrapper).type, JAVA_DELEGATED_EXECUTOR_SERVICE);
	assert.equal(assignable(fixture.runtime, wrapper, EXECUTOR_SERVICE), true);
	assert.equal(assignable(fixture.runtime, wrapper, EXECUTOR), true);
	assert.equal(assignable(fixture.runtime, wrapper, JAVA_THREAD_POOL_EXECUTOR), false);
});

test("delegated shutdown and nested wrappers share concrete state", async () => {
	const fixture = createFixture();
	const wrapper = await fixture.wrap(fixture.delegate);
	const nested = await fixture.wrap(wrapper);
	assert.equal(guestExecutorState(fixture.runtime, nested), fixture.state());
	await fixture.family.invoke(record(EXECUTOR_SERVICE, "shutdown", "()V"), [nested]);
	assert.equal(fixture.state().shutdown, true);
	assert.equal(await fixture.family.invoke(
		record(EXECUTOR_SERVICE, "isShutdown", "()Z"),
		[wrapper]
	), 1);
});

test("delegated service hides concrete configuration", async () => {
	const fixture = createFixture();
	const wrapper = await fixture.wrap(fixture.delegate);
	await assert.rejects(
		fixture.family.invoke(
			record(JAVA_THREAD_POOL_EXECUTOR, "allowCoreThreadTimeOut", "(Z)V"),
			[wrapper, 1]
		),
		error => error.code === "ANDROID_EXECUTOR_STATE_REQUIRED"
	);
});

test("wrapper factory rejects null and uninitialized delegates", async () => {
	const fixture = createFixture();
	await assert.rejects(
		fixture.wrap(0),
		error => error.code === "ANDROID_EXECUTOR_DELEGATE_REQUIRED"
	);
	const uninitialized = fixture.heap.allocate(JAVA_THREAD_POOL_EXECUTOR);
	await assert.rejects(
		fixture.wrap(uninitialized),
		error => error.code === "ANDROID_EXECUTOR_STATE_REQUIRED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap, registry: emptyRegistry() };
	const family = createFrameworkJavaExecutorMethods(runtime);
	const delegate = heap.allocate(JAVA_THREAD_POOL_EXECUTOR);
	initializeGuestExecutor(runtime, delegate);
	return Object.freeze({
		delegate,
		family,
		heap,
		runtime,
		state() {
			return guestExecutorState(runtime, delegate);
		},
		wrap(value) {
			return family.invoke(record(
				EXECUTORS,
				"unconfigurableExecutorService",
				`(${EXECUTOR_SERVICE})${EXECUTOR_SERVICE}`
			), [value]);
		}
	});
}

function assignable(runtime, reference, target) {
	return isClassAssignable(runtime, target, runtime.heap.get(reference).type);
}

function emptyRegistry() {
	return Object.freeze({ classDefinition() { return null; }, superType() { return null; } });
}

function record(classType, name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType, descriptor, name }),
		signature: `${classType}->${name}${descriptor}`
	});
}
