//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState, NATIVE_EGL_CONTEXT_VALUES } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { createNativeGlesStringState, getNativeGlesStringState, NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesStringState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

const THREAD = 0x5000n;
const OTHER_THREAD = 0x6000n;

/**
 * Proves stable guest GLES strings, current-context truth, and isolated errors.
 * The Awtsmoos renews byte, pointer, context, and thread in measured light;
 * Awtsmoos.com lets no host address or stale error cross the graphics night.
 */
test("supported GLES strings are stable NUL-terminated guest bytes", () => {
	const fixture = createFixture(true);
	const expectations = new Map([
		[NATIVE_GLES_STRING_VALUES.VENDOR, "Awtsmoos Android Emulator"],
		[NATIVE_GLES_STRING_VALUES.RENDERER, "Awtsmoos Software GLES"],
		[NATIVE_GLES_STRING_VALUES.VERSION, "OpenGL ES 3.0 Awtsmoos"],
		[NATIVE_GLES_STRING_VALUES.EXTENSIONS, ""],
		[NATIVE_GLES_STRING_VALUES.SHADING_LANGUAGE_VERSION, "OpenGL ES GLSL ES 3.00"]
	]);
	for (const [name, expected] of expectations) {
		const first = fixture.state.queryString(name, THREAD);
		const second = fixture.state.queryString(name, THREAD);
		assert.equal(first.success, true);
		assert.equal(first.result, second.result);
		assert.equal(readCString(fixture.heap, first.result), expected);
	}
});

test("invalid names and missing current contexts preserve thread-local errors", () => {
	const bound = createFixture(true);
	const invalid = bound.state.queryString(0xdead, THREAD);
	bound.state.queryString(0xbeef, THREAD);
	assert.equal(invalid.result, 0n);
	assert.equal(bound.state.takeError(THREAD), NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
	assert.equal(bound.state.takeError(THREAD), NATIVE_GLES_STRING_VALUES.NO_ERROR);
	const missing = bound.state.queryString(NATIVE_GLES_STRING_VALUES.VENDOR, OTHER_THREAD);
	assert.equal(missing.result, 0n);
	assert.equal(bound.state.takeError(OTHER_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
});

test("runtime cache reuses one state without sharing across runtimes", () => {
	const first = createFixture(false);
	const second = createFixture(false);
	const cached = getNativeGlesStringState(first.runtime, first.context);
	assert.equal(getNativeGlesStringState(first.runtime, first.context), cached);
	assert.notEqual(getNativeGlesStringState(second.runtime, second.context), cached);
});

function createFixture(bindCurrent) {
	const heap = createNativeHeap(0x1000n, 0x8000);
	const runtime = Object.freeze({ nativeHeap: heap });
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const context = createNativeEglContextState(displayState, configState);
	const attributes = [{
		key: NATIVE_EGL_CONTEXT_VALUES.CONTEXT_CLIENT_VERSION,
		value: 3
	}];
	const created = context.create(display, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, attributes, THREAD);
	if (bindCurrent) context.bind(THREAD, created.context);
	return {
		context,
		heap,
		runtime,
		state: createNativeGlesStringState(runtime, context)
	};
}

function readCString(memory, pointer) {
	const bytes = memory.read(pointer, 128);
	const end = bytes.indexOf(0);
	return new TextDecoder().decode(bytes.slice(0, end));
}
