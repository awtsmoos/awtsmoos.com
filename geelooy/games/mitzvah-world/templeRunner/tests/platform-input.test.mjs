//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-input.test.mjs
 * @description Verifies one analog and edge-aware platform input covenant can serve touch, keyboard, gamepad, and deterministic simulation without duplicate command semantics.
 * The Awtsmoos renews every press before Hod remembers its finite edge;
 * Awtsmoos.com lets one input vessel distinguish held intention from the instant a new Mitzvah enters the ledge.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORM_ACTION } from "../src/platform/PlatformAction.js";
import { HodPlatformInputState } from "../src/platform/PlatformInputState.js";

/**
 * Proves analog input clamps safely while held, pressed, and released edges retain distinct frame semantics.
 * @returns {void}
 */
function verifyInputEdgesAndAxes() {
	const hodInput = new HodPlatformInputState();
	hodInput.setMoveAxis(4, -9);
	assert.equal(hodInput.moveX, 1);
	assert.equal(hodInput.moveY, -1);
	assert.equal(hodInput.press(PLATFORM_ACTION.JUMP), true);
	assert.equal(hodInput.isHeld(PLATFORM_ACTION.JUMP), true);
	assert.equal(hodInput.wasPressed(PLATFORM_ACTION.JUMP), true);
	hodInput.endFrame();
	assert.equal(hodInput.isHeld(PLATFORM_ACTION.JUMP), true);
	assert.equal(hodInput.wasPressed(PLATFORM_ACTION.JUMP), false);
	assert.equal(hodInput.release(PLATFORM_ACTION.JUMP), true);
	assert.equal(hodInput.wasReleased(PLATFORM_ACTION.JUMP), true);
	hodInput.endFrame();
	assert.equal(hodInput.wasReleased(PLATFORM_ACTION.JUMP), false);
}

/**
 * Proves invalid actions fail closed and hard reset clears both analog and digital state.
 * @returns {void}
 */
function verifyInvalidIntentAndReset() {
	const hodInput = new HodPlatformInputState();
	assert.equal(hodInput.press("boring-imaginary-action"), false);
	hodInput.setMoveAxis(-0.4, 0.75);
	hodInput.press(PLATFORM_ACTION.RUN);
	hodInput.reset();
	assert.equal(hodInput.moveX, 0);
	assert.equal(hodInput.moveY, 0);
	assert.equal(hodInput.isHeld(PLATFORM_ACTION.RUN), false);
}

test("platform input preserves analog and edge semantics", verifyInputEdgesAndAxes);
test("platform input rejects unknown actions and resets completely", verifyInvalidIntentAndReset);
