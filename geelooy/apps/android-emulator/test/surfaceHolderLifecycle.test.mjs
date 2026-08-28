//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { dispatchSurfaceHolderLifecycle } from "../core/android/surfaceHolderLifecycle.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CALLBACK = "Lexample/SurfaceCallback;";
const CREATED = `${CALLBACK}->surfaceCreated(Landroid/view/SurfaceHolder;)V`;
const CHANGED = `${CALLBACK}->surfaceChanged(Landroid/view/SurfaceHolder;III)V`;

/**
 * Proves Android attachment awakens only callbacks actually registered by guest code.
 * The Awtsmoos joins holder, format, callback, width, and height in ordered light;
 * Awtsmoos.com records guest-method testimony once and never duplicates the rite.
 */
test("surface lifecycle dispatches created then changed exactly once", async () => {
	const fixture = createFixture();
	const first = await dispatchSurfaceHolderLifecycle(fixture.input);
	assert.deepEqual(fixture.calls.map(call => call.signature), [CREATED, CHANGED]);
	assert.deepEqual(fixture.calls[0].args, [fixture.callback, fixture.holder]);
	assert.deepEqual(fixture.calls[1].args, [fixture.callback, fixture.holder, -2, 640, 480]);
	assert.equal(first[0].holder, fixture.holder);
	assert.equal(first[0].callbackCount, 1);
	assert.equal(fixture.heap.getField(fixture.holder, "android:surface:lifecycle"), "created");
	assert.deepEqual(await dispatchSurfaceHolderLifecycle(fixture.input), []);
	assert.equal(fixture.calls.length, 2);
});

test("surface lifecycle resolves inherited callback methods", async () => {
	const fixture = createFixture("Lexample/ChildSurfaceCallback;");
	fixture.registry.superType = type => type === "Lexample/ChildSurfaceCallback;" ? CALLBACK : null;
	await dispatchSurfaceHolderLifecycle(fixture.input);
	assert.deepEqual(fixture.calls.map(call => call.signature), [CREATED, CHANGED]);
});

function createFixture(callbackType = CALLBACK) {
	const heap = createDalvikObjectHeap();
	const holder = heap.allocate("Landroid/view/SurfaceHolder;");
	const callback = heap.allocate(callbackType);
	heap.setField(holder, "android:surface:callbacks", Object.freeze([callback]));
	heap.setField(holder, "android:surface:format", -2);
	const calls = [];
	const records = new Map([
		[CREATED, record(CREATED, ["Landroid/view/SurfaceHolder;"])],
		[CHANGED, record(CHANGED, ["Landroid/view/SurfaceHolder;", "I", "I", "I"])]
	]);
	const registry = {
		bySignature(signature) {
			return records.get(signature) || null;
		},
		superType() {
			return null;
		}
	};
	const runtime = {
		heap,
		surfaceHolders: [holder],
		surfaceLifecycleEvidence: []
	};
	return {
		callback,
		calls,
		holder,
		heap,
		input: {
			executor: {
				async invoke(invocationRecord, args) {
					calls.push({ args, signature: invocationRecord.signature });
				}
			},
			options: { surfaceHeight: 480, surfaceWidth: 640 },
			registry,
			runtime
		},
		registry
	};
}

function record(signature, parameters) {
	const arrow = signature.indexOf("->");
	const open = signature.indexOf("(", arrow);
	return {
		code: { insSize: parameters.length + 1 },
		encoded: { accessFlags: 0 },
		method: {
			classType: signature.slice(0, arrow),
			descriptor: signature.slice(open),
			name: signature.slice(arrow + 2, open),
			prototype: { parameters }
		},
		signature
	};
}
