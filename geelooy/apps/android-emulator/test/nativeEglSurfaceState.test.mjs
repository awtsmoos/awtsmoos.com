//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState, NATIVE_EGL_VALUES } from "../core/native/nativeEglDisplayState.js";
import { createNativeEglSurfaceState, NATIVE_EGL_SURFACE_VALUES } from "../core/native/nativeEglSurfaceState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

const THREAD = 0x5000n;
const OTHER_THREAD = 0x6000n;

/**
 * Proves pbuffer identity, current bindings, queries, swaps, and exact errors.
 * The Awtsmoos renews one-by-one surface and thread-bound graphics shore;
 * Awtsmoos.com keeps all rendering vessels inside the guest door.
 */
test("authentic 1x1 pbuffer binds, queries, swaps, and releases", () => {
	const fixture = createFixture();
	const surface = fixture.surface.createPbuffer(fixture.display, fixture.config,
		[{ key: 0x3057, value: 1 }, { key: 0x3056, value: 1 }], THREAD);
	assert.equal(surface.result, NATIVE_EGL_SURFACE_VALUES.SURFACE_HANDLE_START);
	assert.equal(fixture.surface.makeCurrent(fixture.display, surface.result, surface.result,
		fixture.context, THREAD).result, 1n);
	assert.equal(fixture.contextState.current(THREAD), fixture.context);
	assert.equal(fixture.surface.currentSurface(0x3059, THREAD).result, surface.result);
	assert.equal(fixture.surface.currentSurface(0x305a, OTHER_THREAD).result, 0n);
	assert.equal(fixture.surface.query(fixture.display, surface.result, 0x3057, THREAD).value, 1);
	assert.equal(fixture.surface.swap(fixture.display, surface.result, THREAD).result, 1n);
	assert.equal(fixture.surface.makeCurrent(fixture.display, 0n, 0n, 0n, THREAD).result, 1n);
	assert.equal(fixture.contextState.current(THREAD), 0n);
});

test("multiple handles and destruction clear affected bindings", () => {
	const fixture = createFixture();
	const first = fixture.surface.createPbuffer(fixture.display, fixture.config, [], THREAD).result;
	const second = fixture.surface.createPbuffer(fixture.display, fixture.config, [], THREAD).result;
	assert.notEqual(first, second);
	fixture.surface.makeCurrent(fixture.display, first, first, fixture.context, THREAD);
	assert.equal(fixture.surface.destroy(fixture.display, first, THREAD).result, 1n);
	assert.equal(fixture.contextState.current(THREAD), 0n);
	assert.equal(fixture.surface.isSurface(second), true);
});

test("invalid attributes, handles, selectors, and cold display set errors", () => {
	const fixture = createFixture();
	assert.equal(fixture.surface.createPbuffer(fixture.display, fixture.config,
		[{ key: 0xdead, value: 1 }], THREAD).result, 0n);
	assert.equal(fixture.displayState.getError(THREAD), NATIVE_EGL_SURFACE_VALUES.BAD_ATTRIBUTE);
	assert.equal(fixture.surface.currentSurface(0xdead, THREAD).result, 0n);
	assert.equal(fixture.displayState.getError(THREAD), NATIVE_EGL_VALUES.BAD_PARAMETER);
	assert.equal(fixture.surface.makeCurrent(fixture.display, 0xdeadn, 0xdeadn,
		fixture.context, THREAD).result, 0n);
	assert.equal(fixture.displayState.getError(THREAD), NATIVE_EGL_SURFACE_VALUES.BAD_SURFACE);
});

function createFixture() {
	const displayState = createNativeEglDisplayState({ heap: createNativeHeap(0x5000n, 0x4000) });
	const display = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const config = NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE;
	const context = contextState.create(display, config, 0n, [], THREAD).result;
	return { config, context, contextState, display, displayState,
		surface: createNativeEglSurfaceState(displayState, configState, contextState) };
}
