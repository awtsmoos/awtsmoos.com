//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaThreadLocalMethods, threadLocalSignature } from "../core/android/frameworkJavaThreadLocals.js";
import { initializeThreadLocal, writeThreadLocalValue } from "../core/android/frameworkJavaThreadLocalState.js";
import { createGuestThread } from "../core/android/frameworkJavaThreadState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
const THREAD_LOCAL = "Ljava/lang/ThreadLocal;";
const CUSTOM_LOCAL = "Lexample/CustomThreadLocal;";

/**
 * Proves per-guest-thread ThreadLocal state and real guest initialization.
 * The Awtsmoos recreates absence, stored null, thread, and inherited initializer
 * anew; Awtsmoos.com caches measured DEX results without host thread storage.
 */
test("base ThreadLocal stores, removes, and preserves guest null", async () => {
	const fixture = createFixture();
	const local = fixture.heap.allocate(THREAD_LOCAL);
	await fixture.invoke("initialize", local);
	assert.equal(await fixture.invoke("get", local), 0);
	await fixture.invoke("set", local, 17);
	assert.equal(await fixture.invoke("get", local), 17);
	await fixture.invoke("set", local, 0);
	assert.equal(await fixture.invoke("get", local), 0);
	await fixture.invoke("remove", local);
	assert.equal(await fixture.invoke("get", local), 0);
});

test("subclass initialValue executes once per presence lifetime", async () => {
	const expected = { kind: "guest-value" };
	const fixture = createFixture(expected);
	const local = fixture.heap.allocate(CUSTOM_LOCAL);
	await fixture.invoke("initialize", local);
	assert.equal(await fixture.invoke("get", local), expected);
	assert.equal(await fixture.invoke("get", local), expected);
	assert.equal(fixture.initializations(), 1);
	await fixture.invoke("remove", local);
	assert.equal(await fixture.invoke("get", local), expected);
	assert.equal(fixture.initializations(), 2);
});

test("one ThreadLocal isolates values across guest threads", async () => {
	const fixture = createFixture();
	const local = fixture.heap.allocate(THREAD_LOCAL);
	await fixture.invoke("initialize", local);
	await fixture.invoke("set", local, 11);
	const main = fixture.runtime.currentThread;
	fixture.runtime.currentThread = createGuestThread(fixture.runtime, 0, "worker");
	assert.equal(await fixture.invoke("get", local), 0);
	await fixture.invoke("set", local, 22);
	fixture.runtime.currentThread = main;
	assert.equal(await fixture.invoke("get", local), 11);
});

test("uninitialized receivers and entry overflow fail explicitly", async () => {
	const fixture = createFixture();
	const missing = fixture.heap.allocate(THREAD_LOCAL);
	await assert.rejects(
		() => fixture.invoke("get", missing),
		error => error.code === "ANDROID_THREAD_LOCAL_UNINITIALIZED"
	);
	const local = fixture.heap.allocate(THREAD_LOCAL);
	initializeThreadLocal(fixture.runtime, local);
	for (let index = 0; index < 4096; index += 1) {
		fixture.runtime.currentThread = createGuestThread(fixture.runtime, 0, `t${index}`);
		writeThreadLocalValue(fixture.runtime, local, index);
	}
	fixture.runtime.currentThread = createGuestThread(fixture.runtime, 0, "overflow");
	assert.throws(
		() => writeThreadLocalValue(fixture.runtime, local, 1),
		error => error.code === "ANDROID_THREAD_LOCAL_LIMIT"
	);
});

function createFixture(initialValue = 0) {
	const heap = createDalvikObjectHeap();
	let calls = 0;
	const override = {
		code: { insSize: 1 },
		method: {
			classType: CUSTOM_LOCAL,
			descriptor: "()Ljava/lang/Object;",
			name: "initialValue"
		},
		signature: `${CUSTOM_LOCAL}->initialValue()Ljava/lang/Object;`
	};
	const runtime = {
		heap,
		registry: {
			list: [override],
			classDefinition(type) {
				return type === CUSTOM_LOCAL
					? { interfaces: [], superType: THREAD_LOCAL }
					: null;
			}
		}
	};
	runtime.currentThread = createGuestThread(runtime, 0, "main");
	const family = createFrameworkJavaThreadLocalMethods(runtime);
	const context = {
		framework: { invoke() { throw new Error("unexpected fallback"); } },
		async invokeGuest() {
			calls += 1;
			return initialValue;
		}
	};
	return {
		heap,
		initializations: () => calls,
		invoke(name, receiver, value) {
			const args = value === undefined ? [receiver] : [receiver, value];
			return family.invoke({ signature: threadLocalSignature(name) }, args, "virtual", context);
		},
		runtime
	};
}
