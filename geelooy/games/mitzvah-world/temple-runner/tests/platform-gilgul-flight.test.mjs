//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-gilgul-flight.test.mjs
 * @description Verifies Gilgul priority/rebound, Ohr Mantle glide/earned launch readiness, Ruach gravity aid, and immutable player revelations.
 * The Awtsmoos renews turn, mantle, breath, and ascent before any air law can own the sky;
 * Awtsmoos.com lets each power remain a separate vessel while their shared snapshot reveals one playable why.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORM_ACTION } from "../src/platform/PlatformAction.js";
import { revealPlatformPlayerSnapshot } from "../src/platform/PlatformPlayerSnapshot.js";
import { PLATFORM_FORM } from "../src/platform/PlatformPowerFormState.js";
import { advancePlatformFrames, revealPlatformFoundation } from "./support/PlatformFoundationHarness.mjs";

/** Proves Gilgul wins simultaneous takeoff priority and can rebound only while its offensive window is active. */
function verifyGilgulPriorityAndRebound() {
	const orot = revealPlatformFoundation();
	orot.input.press(PLATFORM_ACTION.JUMP);
	orot.input.press(PLATFORM_ACTION.GILGUL);
	const aliyah = orot.solver.update(1 / 60);
	assert.equal(aliyah.gilgul, true);
	assert.equal(aliyah.jumped, false);
	orot.body.velocityY = -2;
	assert.equal(orot.gilgul.rebound(orot.body), true);
	assert.ok(orot.body.velocityY > 0);
	orot.gilgul.update(2);
	assert.equal(orot.gilgul.rebound(orot.body), false);
}

/** Proves Mantle glide caps descent and fully-earned Ratzo remains launch-ready through initial airborne transition. */
function verifyMantleGlideAndLaunchBridge() {
	const orot = revealPlatformFoundation({ y: 4 });
	orot.power.collectForm(PLATFORM_FORM.MANTLE);
	orot.locomotion.netzachRatzo.time = 0.62;
	orot.body.grounded = false;
	orot.body.velocityY = -9;
	orot.input.press(PLATFORM_ACTION.JUMP);
	orot.solver.update(1 / 60);
	assert.ok(orot.body.velocityY >= -4.2);
	const mantleLaw = orot.mantle.revealAirLaw(orot.body, orot.locomotion, orot.power, orot.input);
	assert.equal(mantleLaw.gliding, true);
	assert.equal(mantleLaw.launchReady, true);
}

/** Proves temporary Ruach aid expires deterministically and frozen player snapshots expose no mutable engines. */
function verifyRuachAndSnapshot() {
	const orot = revealPlatformFoundation({ y: 10 });
	orot.body.grounded = false;
	orot.body.velocityY = 0;
	orot.ruach.activate(0.1);
	advancePlatformFrames(orot, 3);
	assert.equal(orot.ruach.active, true);
	const ruachVelocity = orot.body.velocityY;
	orot.ruach.update(0.2);
	assert.equal(orot.ruach.active, false);
	assert.ok(ruachVelocity > -2);
	const malchusSnapshot = revealPlatformPlayerSnapshot(orot);
	assert.equal(Object.isFrozen(malchusSnapshot), true);
	assert.equal("solver" in malchusSnapshot, false);
	assert.equal("input" in malchusSnapshot, false);
}

test("Gilgul has takeoff priority and bounded rebound", verifyGilgulPriorityAndRebound);
test("Mantle glide preserves earned Ratzo launch readiness", verifyMantleGlideAndLaunchBridge);
test("Ruach float expires and snapshot stays immutable", verifyRuachAndSnapshot);
