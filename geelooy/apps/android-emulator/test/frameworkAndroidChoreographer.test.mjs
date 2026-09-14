//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidChoreographerMethods } from "../core/android/frameworkAndroidChoreographer.js";
import { snapshotFrameworkAndroidChoreographer } from "../core/android/frameworkAndroidChoreographer.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CHOREOGRAPHER = "Landroid/view/Choreographer;";
const CALLBACK = "Ltest/FrameCallback;";

/**
 * Builds a real heap-backed guest callback with controllable root-lease state.
 * The fixture observes guest DEX invocation rather than substituting nativeOnVsync.
 */
function fixture() {
	const heap = createDalvikObjectHeap();
	const calls = [];
	let active = true;
	const callback = heap.allocate(CALLBACK);
	const callbackRecord = Object.freeze({
		code: Object.freeze({ instructionUnits: 1 }),
		method: Object.freeze({ classType: CALLBACK, descriptor: "(J)V", name: "doFrame" }),
		signature: `${CALLBACK}->doFrame(J)V`
	});
	const runtime = {
		flutterNativeSessionPromise: Promise.resolve({
			state: { nativeRootExecution: { active: () => active } }
		}),
		heap,
		registry: {
			classDefinition() {
				return null;
			},
			list: [callbackRecord]
		}
	};
	const context = {
		framework: {
			invoke() {
				throw new Error("TEST_UNEXPECTED_FRAMEWORK_CALLBACK");
			}
		},
		invokeGuest(record, args) {
			calls.push({ args, signature: record.signature });
		}
	};
	return {
		callback,
		calls,
		context,
		family: createFrameworkAndroidChoreographerMethods(runtime),
		release() {
			active = false;
		},
		runtime
	};
}

function record(name, descriptor) {
	return {
		method: { classType: CHOREOGRAPHER, descriptor, name },
		signature: `${CHOREOGRAPHER}->${name}${descriptor}`
	};
}

function delay(milliseconds) {
	return new Promise(resolve => globalThis.setTimeout(resolve, milliseconds));
}

test("Java Choreographer defers doFrame until Flutter root execution is idle", async () => {
	const f = fixture();
	const instance = f.family.invoke(record("getInstance", "()Landroid/view/Choreographer;"), []);
	f.family.invoke(
		record("postFrameCallback", "(Landroid/view/Choreographer$FrameCallback;)V"),
		[instance, f.callback],
		"virtual",
		f.context
	);
	await delay(25);
	assert.equal(f.calls.length, 0);
	assert.equal(snapshotFrameworkAndroidChoreographer(f.runtime).pending, 1);
	f.release();
	await delay(30);
	assert.equal(f.calls.length, 1);
	assert.equal(f.calls[0].signature, `${CALLBACK}->doFrame(J)V`);
	assert.deepEqual(f.calls[0].args, [f.callback, 16666667n]);
	assert.equal(snapshotFrameworkAndroidChoreographer(f.runtime).pending, 0);
});

test("Java Choreographer removal cancels a pending one-shot callback", async () => {
	const f = fixture();
	const instance = f.family.invoke(record("getInstance", "()Landroid/view/Choreographer;"), []);
	f.family.invoke(
		record("postFrameCallback", "(Landroid/view/Choreographer$FrameCallback;)V"),
		[instance, f.callback],
		"virtual",
		f.context
	);
	f.family.invoke(
		record("removeFrameCallback", "(Landroid/view/Choreographer$FrameCallback;)V"),
		[instance, f.callback]
	);
	f.release();
	await delay(30);
	assert.equal(f.calls.length, 0);
	assert.equal(snapshotFrameworkAndroidChoreographer(f.runtime).pending, 0);
});
