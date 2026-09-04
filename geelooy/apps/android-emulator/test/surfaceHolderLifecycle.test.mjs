//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";

import { dispatchSurfaceHolderLifecycle } from "../core/android/surfaceHolderLifecycle.js";
import {
	CALLBACK,
	CHANGED,
	CREATED,
	createSurfaceHolderFixture,
	surfaceCallSignatures
} from "./support/surfaceHolderLifecycleFixture.mjs";

/**
 * Proves Android attachment awakens guest callbacks with truthful surface dimensions.
 * The Awtsmoos joins holder, runtime size, and fallback in ordered light;
 * Awtsmoos.com records guest-method testimony once and never duplicates the rite.
 */
test("surface lifecycle dispatches created then changed exactly once", async function lifecycleOnce() {
	const fixture = createSurfaceHolderFixture();
	const first = await dispatchSurfaceHolderLifecycle(fixture.input);
	assert.deepEqual(surfaceCallSignatures(fixture.calls), [CREATED, CHANGED]);
	assert.deepEqual(fixture.calls[0].args, [fixture.callback, fixture.holder]);
	assert.deepEqual(fixture.calls[1].args, [fixture.callback, fixture.holder, -2, 640, 480]);
	assert.equal(first[0].holder, fixture.holder);
	assert.equal(first[0].callbackCount, 1);
	assert.equal(fixture.heap.getField(fixture.holder, "android:surface:lifecycle"), "created");
	assert.deepEqual(await dispatchSurfaceHolderLifecycle(fixture.input), []);
	assert.equal(fixture.calls.length, 2);
});

test("runtime dimensions take precedence over explicit fallback options", async function runtimeWins() {
	const fixture = createSurfaceHolderFixture();
	fixture.input.runtime.surfaceWidth = 320;
	fixture.input.runtime.surfaceHeight = 240;
	const evidence = await dispatchSurfaceHolderLifecycle(fixture.input);
	assert.deepEqual(fixture.calls[1].args, [fixture.callback, fixture.holder, -2, 320, 240]);
	assert.deepEqual({ width: evidence[0].width, height: evidence[0].height }, {
		height: 240,
		width: 320
	});
});

test("surface lifecycle resolves inherited callback methods", async function inheritedCallbacks() {
	const fixture = createSurfaceHolderFixture("Lexample/ChildSurfaceCallback;");
	fixture.registry.superType = function resolveSuperType(type) {
		if (type === "Lexample/ChildSurfaceCallback;") {
			return CALLBACK;
		}
		return null;
	};
	await dispatchSurfaceHolderLifecycle(fixture.input);
	assert.deepEqual(surfaceCallSignatures(fixture.calls), [CREATED, CHANGED]);
});
