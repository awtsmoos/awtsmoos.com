//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglDisplayState, NATIVE_EGL_VALUES } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

const THREAD = 0x5000n;
const OTHER_THREAD = 0x6000n;

/**
 * Proves config selection follows display lifecycle and shared EGL errors.
 * The Awtsmoos renews one config vessel, requested pairs, and thread-local ray;
 * Awtsmoos.com keeps selection deterministic without host graphics sway.
 */
test("initialized display selects one stable config with immutable attributes", () => {
	const { config, display, handle } = fixture(true);
	const attributes = [{ key: 0x3024, value: 8 }, { key: 0x3040, value: 4 }];
	const first = config.choose(handle, attributes, THREAD);
	const second = config.choose(handle, [], THREAD);
	assert.equal(first.result, 1n);
	assert.equal(first.config, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE);
	assert.equal(second.config, first.config);
	assert.equal(first.configCount, 1);
	assert.deepEqual(first.attributes, attributes);
	assert.equal(display.getError(THREAD), NATIVE_EGL_VALUES.SUCCESS);
});

test("bad and uninitialized displays report shared thread-local EGL errors", () => {
	const cold = fixture(false);
	assert.equal(cold.config.choose(cold.handle, [], THREAD).result, 0n);
	assert.equal(cold.display.getError(THREAD), NATIVE_EGL_VALUES.NOT_INITIALIZED);
	assert.equal(cold.config.choose(0xdeadn, [], OTHER_THREAD).result, 0n);
	assert.equal(cold.display.getError(OTHER_THREAD), NATIVE_EGL_VALUES.BAD_DISPLAY);
});

test("config identity rejects every unrelated guest handle", () => {
	const { config } = fixture(true);
	assert.equal(config.isConfig(NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE), true);
	assert.equal(config.isConfig(0n), false);
	assert.equal(config.snapshot().config, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE.toString());
});

function fixture(initialized) {
	const display = createNativeEglDisplayState({ heap: createNativeHeap(0x5000n, 0x2000) });
	const handle = display.getDisplay(0n, THREAD).result;
	if (initialized) display.initialize(handle, THREAD);
	return { config: createNativeEglConfigState(display), display, handle };
}
