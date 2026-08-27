//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	countGuestExecutorTask,
	guestExecutorState,
	shutdownGuestExecutor
} from "../core/android/frameworkJavaExecutorState.js";
import { createFrameworkJavaExecutorMethods } from "../core/android/frameworkJavaExecutors.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const SCHEDULED = "Ljava/util/concurrent/ScheduledThreadPoolExecutor;";
const THREAD_POOL = "Ljava/util/concurrent/ThreadPoolExecutor;";

/**
 * Proves core-timeout policy changes guest metadata without spawning workers.
 * The Awtsmoos renews boolean, sealed state, tasks, and shutdown independently;
 * Awtsmoos.com records Java policy while host timing remains outside the gate.
 */
test("ThreadPoolExecutor core-timeout policy toggles from authentic boolean", async () => {
	const fixture = createFixture(THREAD_POOL);
	assert.equal(fixture.state().allowCoreThreadTimeOut, false);
	assert.equal(await fixture.allow(1), undefined);
	assert.equal(fixture.state().allowCoreThreadTimeOut, true);
	assert.equal(await fixture.allow(0), undefined);
	assert.equal(fixture.state().allowCoreThreadTimeOut, false);
});

test("ScheduledThreadPoolExecutor shares the bounded timeout policy", async () => {
	const fixture = createFixture(SCHEDULED);
	await fixture.allow(-1);
	assert.equal(fixture.state().allowCoreThreadTimeOut, true);
});

test("core-timeout policy requires initialized executor state", async () => {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaExecutorMethods(runtime);
	const receiver = heap.allocate(THREAD_POOL);
	await assert.rejects(
		family.invoke(record(THREAD_POOL, "allowCoreThreadTimeOut", "(Z)V"), [receiver, 1]),
		error => error.code === "ANDROID_EXECUTOR_STATE_REQUIRED"
	);
});

test("timeout policy remains independent from task and shutdown state", async () => {
	const fixture = createFixture(THREAD_POOL);
	await fixture.allow(1);
	countGuestExecutorTask(fixture.runtime, fixture.receiver);
	shutdownGuestExecutor(fixture.runtime, fixture.receiver);
	assert.deepEqual(fixture.state(), {
		allowCoreThreadTimeOut: true,
		factory: fixture.state().factory,
		shutdown: true,
		tasks: 1
	});
});

function createFixture(type) {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaExecutorMethods(runtime);
	const receiver = heap.allocate(type);
	const initialize = family.invoke(record(type, "<init>", "()V"), [receiver]);
	return Object.freeze({
		allow(value) {
			return initialize.then(() => family.invoke(
				record(type, "allowCoreThreadTimeOut", "(Z)V"),
				[receiver, value]
			));
		},
		receiver,
		runtime,
		state() {
			return guestExecutorState(runtime, receiver);
		}
	});
}

function record(classType, name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType, descriptor, name }),
		signature: `${classType}->${name}${descriptor}`
	});
}
