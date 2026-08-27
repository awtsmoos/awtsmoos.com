//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState, NATIVE_EGL_CONTEXT_VALUES } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState, NATIVE_EGL_VALUES } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

const THREAD = 0x5000n;
const OTHER_THREAD = 0x6000n;

/**
 * Proves deterministic EGL context identity, sharing, destruction, and errors.
 * The Awtsmoos renews context ancestry and thread-current shore;
 * Awtsmoos.com returns no host graphics vessel through the guest door.
 */
test("initialized display and selected config create stable guest contexts", () => {
	const fixture = createFixture(true);
	const attributes = [{ key: NATIVE_EGL_CONTEXT_VALUES.CONTEXT_CLIENT_VERSION, value: 2 }];
	const first = fixture.context.create(fixture.display, fixture.config, 0n, attributes, THREAD);
	const second = fixture.context.create(fixture.display, fixture.config, first.context, [], THREAD);
	assert.equal(first.context, NATIVE_EGL_CONTEXT_VALUES.CONTEXT_HANDLE_START);
	assert.notEqual(second.context, first.context);
	assert.equal(second.success, true);
	assert.deepEqual(first.attributes, attributes);
	assert.equal(fixture.displayState.getError(THREAD), NATIVE_EGL_VALUES.SUCCESS);
});

test("invalid display, cold display, config, and share set exact errors", () => {
	const hot = createFixture(true);
	assert.equal(hot.context.create(0xdeadn, hot.config, 0n, [], THREAD).result, 0n);
	assert.equal(hot.displayState.getError(THREAD), NATIVE_EGL_VALUES.BAD_DISPLAY);
	assert.equal(hot.context.create(hot.display, 0xdeadn, 0n, [], THREAD).result, 0n);
	assert.equal(hot.displayState.getError(THREAD), NATIVE_EGL_CONTEXT_VALUES.BAD_CONFIG);
	assert.equal(hot.context.create(hot.display, hot.config, 0xdeadn, [], THREAD).result, 0n);
	assert.equal(hot.displayState.getError(THREAD), NATIVE_EGL_CONTEXT_VALUES.BAD_CONTEXT);
	const cold = createFixture(false);
	assert.equal(cold.context.create(cold.display, cold.config, 0n, [], THREAD).result, 0n);
	assert.equal(cold.displayState.getError(THREAD), NATIVE_EGL_VALUES.NOT_INITIALIZED);
});

test("destroy removes live identity and current defaults remain thread-local zero", () => {
	const fixture = createFixture(true);
	const created = fixture.context.create(fixture.display, fixture.config, 0n, [], THREAD);
	assert.equal(fixture.context.current(THREAD), 0n);
	assert.equal(fixture.context.current(OTHER_THREAD), 0n);
	assert.equal(fixture.context.destroy(fixture.display, created.context, THREAD).result, 1n);
	assert.equal(fixture.context.isContext(created.context), false);
	assert.equal(fixture.context.destroy(fixture.display, created.context, THREAD).result, 0n);
	assert.equal(fixture.displayState.getError(THREAD), NATIVE_EGL_CONTEXT_VALUES.BAD_CONTEXT);
});

function createFixture(initialized) {
	const displayState = createNativeEglDisplayState({ heap: createNativeHeap(0x5000n, 0x3000) });
	const display = displayState.getDisplay(0n, THREAD).result;
	if (initialized) displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	return { config: NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE,
		context: createNativeEglContextState(displayState, configState), display, displayState };
}
