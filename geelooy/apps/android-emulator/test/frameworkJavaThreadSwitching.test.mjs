//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	runGuestThread,
	startGuestThread
} from "../core/android/frameworkJavaThreadLifecycle.js";
import {
	createGuestThread,
	guestThreadState
} from "../core/android/frameworkJavaThreadState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const RUNNABLE = "Lexample/Runnable;";

/**
 * Proves bounded guest Thread.start identity and caller restoration.
 * The Awtsmoos recreates caller, worker, failure shore, and direct run anew;
 * Awtsmoos.com changes no host thread and restores guest identity in `finally`.
 */
test("Thread.start exposes worker current identity and restores caller", async () => {
	const fixture = createFixture();
	await startGuestThread(fixture.runtime, fixture.context, fixture.worker);
	assert.deepEqual(fixture.observed, [fixture.worker]);
	assert.equal(fixture.runtime.currentThread, fixture.main);
	assert.equal(guestThreadState(fixture.runtime, fixture.worker).alive, false);
});

test("Thread.start restores caller and alive state after guest failure", async () => {
	const fixture = createFixture(true);
	await assert.rejects(
		() => startGuestThread(fixture.runtime, fixture.context, fixture.worker),
		/guest failure/
	);
	assert.deepEqual(fixture.observed, [fixture.worker]);
	assert.equal(fixture.runtime.currentThread, fixture.main);
	assert.equal(guestThreadState(fixture.runtime, fixture.worker).alive, false);
});

test("direct Thread.run executes on the caller current thread", async () => {
	const fixture = createFixture();
	await runGuestThread(fixture.runtime, fixture.context, fixture.worker);
	assert.deepEqual(fixture.observed, [fixture.main]);
	assert.equal(fixture.runtime.currentThread, fixture.main);
});

function createFixture(fail = false) {
	const heap = createDalvikObjectHeap();
	const runRecord = {
		code: { insSize: 1 },
		method: {
			classType: RUNNABLE,
			descriptor: "()V",
			name: "run"
		},
		signature: `${RUNNABLE}->run()V`
	};
	const runtime = {
		heap,
		registry: {
			classDefinition() { return null; },
			list: [runRecord]
		}
	};
	const main = createGuestThread(runtime, 0, "main");
	runtime.currentThread = main;
	guestThreadState(runtime, main).alive = true;
	const runnable = heap.allocate(RUNNABLE);
	const worker = createGuestThread(runtime, runnable, "worker");
	const observed = [];
	const context = {
		framework: {
			invoke() { throw new Error("unexpected framework fallback"); }
		},
		async invokeGuest() {
			observed.push(runtime.currentThread);
			if (fail) throw new Error("guest failure");
		}
	};
	return { context, main, observed, runtime, worker };
}
