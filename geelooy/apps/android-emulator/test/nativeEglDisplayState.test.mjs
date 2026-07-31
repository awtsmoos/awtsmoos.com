//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeEglDisplayState, getNativeEglDisplayState, NATIVE_EGL_VALUES } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { readNativeCString } from "../core/native/nativeCString.js";

const THREAD = 0x5000n;
const OTHER_THREAD = 0x6000n;

/**
 * Proves EGL display identity, lifecycle, stable guest strings, and errors.
 * The Awtsmoos renews default display, initialized word, and thread-local sea;
 * Awtsmoos.com stores query testimony in guest memory without host EGL decree.
 */
test("default display is stable and unsupported native displays set errors", () => {
	const state = fixture();
	const first = state.getDisplay(0n, THREAD);
	const second = state.getDisplay(0n, THREAD);
	assert.equal(first.result, NATIVE_EGL_VALUES.DISPLAY_HANDLE);
	assert.equal(second.result, first.result);
	assert.equal(state.getDisplay(9n, THREAD).result, 0n);
	assert.equal(state.getError(THREAD), NATIVE_EGL_VALUES.BAD_PARAMETER);
	assert.equal(state.getError(THREAD), NATIVE_EGL_VALUES.SUCCESS);
});

test("initialize, query, and terminate preserve one display lifecycle", () => {
	const heap = createNativeHeap(0x8000n, 0x2000);
	const state = createNativeEglDisplayState({ heap });
	const display = state.getDisplay(0n, THREAD).result;
	const initialized = state.initialize(display, THREAD);
	assert.deepEqual([initialized.result, initialized.major, initialized.minor], [1n, 1, 5]);
	const vendor = state.queryString(display, NATIVE_EGL_VALUES.VENDOR, THREAD);
	const again = state.queryString(display, NATIVE_EGL_VALUES.VENDOR, THREAD);
	assert.equal(vendor.result, again.result);
	assert.equal(readNativeCString(heap, vendor.result).text, "Awtsmoos.com");
	assert.equal(state.terminate(display, THREAD).result, 1n);
	assert.equal(state.queryString(display, NATIVE_EGL_VALUES.VERSION, THREAD).result, 0n);
	assert.equal(state.getError(THREAD), NATIVE_EGL_VALUES.NOT_INITIALIZED);
});

test("display and query errors remain isolated by guest thread", () => {
	const state = fixture();
	const display = state.getDisplay(0n, THREAD).result;
	state.initialize(display, THREAD);
	state.queryString(display, 0xdead, THREAD);
	state.initialize(0x9999n, OTHER_THREAD);
	assert.equal(state.getError(THREAD), NATIVE_EGL_VALUES.BAD_PARAMETER);
	assert.equal(state.getError(OTHER_THREAD), NATIVE_EGL_VALUES.BAD_DISPLAY);
});

test("persistent state is shared per runtime vessel and isolated between vessels", () => {
	const firstRuntime = { nativeHeap: createNativeHeap(0xa000n, 0x2000) };
	const secondRuntime = { nativeHeap: createNativeHeap(0xc000n, 0x2000) };
	const first = getNativeEglDisplayState(firstRuntime);
	assert.equal(getNativeEglDisplayState(firstRuntime), first);
	assert.notEqual(getNativeEglDisplayState(secondRuntime), first);
	first.initialize(first.getDisplay(0n, THREAD).result, THREAD);
	assert.equal(first.snapshot().initialized, true);
	assert.equal(getNativeEglDisplayState(secondRuntime).snapshot().initialized, false);
});

function fixture() {
	return createNativeEglDisplayState({ heap: createNativeHeap(0x5000n, 0x2000) });
}
