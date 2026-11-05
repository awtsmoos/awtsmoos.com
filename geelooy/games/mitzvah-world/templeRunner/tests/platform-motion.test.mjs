//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-motion.test.mjs
 * @description Attacks the deterministic platform foundation across acceleration, Ratzo run, authentic post-ledge coyote mercy, buffered landing jumps, variable ascent, crouch gating, and fast descent.
 * The Awtsmoos renews every frame before momentum or mercy can claim continuity by itself;
 * Awtsmoos.com lets tests recreate real contact history so a platformer earns trust at every hidden edge of the shelf.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORM_ACTION } from "../src/platform/PlatformAction.js";
import {
	advancePlatformFrames,
	revealPlatformFoundation
} from "./support/PlatformFoundationHarness.mjs";

/**
 * Proves Ratzo running accelerates beyond walking and eventually latches its mastery covenant.
 * @returns {void}
 */
function verifyWalkRunAndRatzo() {
	const walkingOrot = revealPlatformFoundation();
	walkingOrot.input.setMoveAxis(1);
	advancePlatformFrames(walkingOrot, 45);
	const runningOrot = revealPlatformFoundation();
	runningOrot.input.setMoveAxis(1);
	runningOrot.input.press(PLATFORM_ACTION.RUN);
	advancePlatformFrames(runningOrot, 60);
	assert.ok(runningOrot.body.velocityX > walkingOrot.body.velocityX);
	assert.ok(runningOrot.body.velocityX > 7.5);
	assert.equal(runningOrot.locomotion.netzachRatzo.charged, true);
}

/**
 * Proves coyote mercy comes from genuine prior ground contact while crouch posture blocks same-frame takeoff.
 * @returns {void}
 */
function verifyCoyoteAndCrouchGate() {
	const coyoteOrot = revealPlatformFoundation();
	coyoteOrot.solver.update(1 / 60);
	coyoteOrot.body.grounded = false;
	coyoteOrot.body.y = 0.4;
	coyoteOrot.body.velocityY = 0;
	coyoteOrot.solver.update(0.04);
	coyoteOrot.input.press(PLATFORM_ACTION.JUMP);
	assert.equal(coyoteOrot.solver.update(1 / 60).jumped, true);

	const crouchOrot = revealPlatformFoundation();
	crouchOrot.input.press(PLATFORM_ACTION.CROUCH);
	crouchOrot.input.press(PLATFORM_ACTION.JUMP);
	assert.equal(crouchOrot.solver.update(1 / 60).jumped, false);
	assert.equal(crouchOrot.body.grounded, true);
}

/**
 * Proves an early jump press survives until landing and begins on the next eligible grounded frame.
 * @returns {void}
 */
function verifyBufferedLandingJump() {
	const orot = revealPlatformFoundation({ y: 0.08 });
	orot.body.grounded = false;
	orot.body.velocityY = -3;
	orot.input.press(PLATFORM_ACTION.JUMP);
	assert.equal(orot.solver.update(1 / 60).jumped, false);
	advancePlatformFrames(orot, 2);
	assert.ok(orot.body.velocityY > 0, "buffered jump should fire after landing");
}

/**
 * Proves releasing jump early shortens ascent and crouch fast-fall exceeds the ordinary terminal descent cap.
 * @returns {void}
 */
function verifyVariableJumpAndFastFall() {
	const heldOrot = revealPlatformFoundation();
	heldOrot.input.press(PLATFORM_ACTION.JUMP);
	heldOrot.solver.update(1 / 60);
	const releasedOrot = revealPlatformFoundation();
	releasedOrot.input.press(PLATFORM_ACTION.JUMP);
	releasedOrot.solver.update(1 / 60);
	releasedOrot.input.release(PLATFORM_ACTION.JUMP);
	advancePlatformFrames(heldOrot, 8);
	advancePlatformFrames(releasedOrot, 8);
	assert.ok(heldOrot.body.y > releasedOrot.body.y);

	const fastOrot = revealPlatformFoundation({ y: 20 });
	fastOrot.body.grounded = false;
	fastOrot.body.velocityY = -20;
	fastOrot.input.press(PLATFORM_ACTION.CROUCH);
	advancePlatformFrames(fastOrot, 30);
	assert.ok(fastOrot.body.velocityY < -22);
}

test("Ratzo running exceeds walking and reaches charge", verifyWalkRunAndRatzo);
test("real post-ledge coyote mercy works while crouch blocks takeoff", verifyCoyoteAndCrouchGate);
test("early jump input survives through landing", verifyBufferedLandingJump);
test("variable jump and fast descent change vertical motion", verifyVariableJumpAndFastFall);
