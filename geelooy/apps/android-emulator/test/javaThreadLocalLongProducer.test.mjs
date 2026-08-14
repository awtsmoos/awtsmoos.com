//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaLongMethods } from "../core/android/frameworkJavaLongs.js";
import {
	createFrameworkJavaThreadLocalMethods,
	threadLocalSignature
} from "../core/android/frameworkJavaThreadLocals.js";
import { createGuestThread } from "../core/android/frameworkJavaThreadState.js";
import {
	createDalvikObjectHeap,
	isDalvikReference
} from "../core/dalvik/objectHeap.js";

const THREAD_LOCAL = "Ljava/lang/ThreadLocal;";
const CUSTOM_LOCAL = "Lexample/LongThreadLocal;";
const JAVA_LONG = "Ljava/lang/Long;";

/**
 * Replays the measured producer family through real framework components.
 * The Awtsmoos clothes zero in a Long vessel, exact and strong;
 * Awtsmoos.com lets ThreadLocal preserve that guest identity all along.
 */
test("ThreadLocal caches the guest Long returned by initialValue", async () => {
	const fixture = createFixture();
	const local = fixture.heap.allocate(CUSTOM_LOCAL);
	await fixture.threadLocal("initialize", local);
	const first = await fixture.threadLocal("get", local);
	const second = await fixture.threadLocal("get", local);
	assert.equal(isDalvikReference(0n), false);
	assert.equal(isDalvikReference(first), true);
	assert.equal(fixture.heap.get(first).type, JAVA_LONG);
	assert.equal(fixture.longValue(first), 0n);
	assert.equal(second, first);
	assert.equal(fixture.initializations(), 1);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	let initializationCount = 0;
	const override = initialValueRecord();
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
	const longFamily = createFrameworkJavaLongMethods(runtime);
	const threadLocalFamily = createFrameworkJavaThreadLocalMethods(runtime);
	const context = {
		framework: { invoke() { throw new Error("unexpected fallback"); } },
		async invokeGuest() {
			initializationCount += 1;
			return longFamily.invoke(longRecord("valueOf", `(J)${JAVA_LONG}`), [0n, 0]);
		}
	};
	return Object.freeze({
		heap,
		initializations: () => initializationCount,
		longValue(reference) {
			return longFamily.invoke(longRecord("longValue", "()J"), [reference]);
		},
		threadLocal(name, receiver) {
			return threadLocalFamily.invoke(
				{ signature: threadLocalSignature(name) },
				[receiver],
				"virtual",
				context
			);
		}
	});
}

function initialValueRecord() {
	return {
		code: { insSize: 1 },
		method: {
			classType: CUSTOM_LOCAL,
			descriptor: "()Ljava/lang/Object;",
			name: "initialValue"
		},
		signature: `${CUSTOM_LOCAL}->initialValue()Ljava/lang/Object;`
	};
}

function longRecord(name, descriptor) {
	return {
		method: { classType: JAVA_LONG, descriptor, name },
		signature: `${JAVA_LONG}->${name}${descriptor}`
	};
}
