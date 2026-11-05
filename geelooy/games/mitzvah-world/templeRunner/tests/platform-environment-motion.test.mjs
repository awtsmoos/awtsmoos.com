//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-environment-motion.test.mjs
 * @description Verifies water, climbable planes, and authored Sulam walls through the complete platform solver instead of isolated helper calls.
 * The Awtsmoos renews sea, vine, wall, and priority before several contacts can fight for one frame;
 * Awtsmoos.com lets tests prove one law owns one instant while every alternate path still carries its proper name.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORM_ACTION } from "../src/platform/PlatformAction.js";
import { LOCOMOTION_MODE } from "../src/platform/PlatformLocomotionState.js";
import { PLATFORM_MOTION } from "../src/platform/PlatformMotionTuning.js";
import { advancePlatformFrames, revealPlatformFoundation } from "./support/PlatformFoundationHarness.mjs";

/** Proves submersion outranks climb and wall contact, and jump becomes a swim stroke rather than ordinary takeoff. */
function verifyWaterPriorityAndStroke() {
	const orot = revealPlatformFoundation({ y: 4 });
	orot.environment.enterWater({ currentX: 2.5, currentY: 0.4 });
	orot.environment.setClimbable(true, true);
	orot.environment.setSulamWall(1, true);
	orot.input.press(PLATFORM_ACTION.ACTION);
	orot.input.press(PLATFORM_ACTION.JUMP);
	const mayimOutcome = orot.solver.update(1 / 60);
	assert.equal(mayimOutcome.mode, "swim");
	assert.equal(mayimOutcome.outcome.stroke, true);
	assert.equal(orot.locomotion.mode, LOCOMOTION_MODE.SWIM);
	assert.ok(orot.body.velocityY > 0);
	assert.ok(orot.body.velocityX > 0);
}

/** Proves a held jump cannot repeat swim strokes until a new press edge occurs and cooldown has elapsed. */
function verifySwimStrokeEdges() {
	const orot = revealPlatformFoundation({ y: 5 });
	orot.environment.enterWater();
	orot.input.press(PLATFORM_ACTION.JUMP);
	assert.equal(orot.solver.update(1 / 60).outcome.stroke, true);
	assert.equal(orot.solver.update(1 / 60).outcome.stroke, false);
	orot.input.release(PLATFORM_ACTION.JUMP);
	advancePlatformFrames(orot, 14);
	orot.input.press(PLATFORM_ACTION.JUMP);
	assert.equal(orot.solver.update(1 / 60).outcome.stroke, true);
}

/** Proves climb entry suspends gravity, authored plane swapping toggles, and jump detaches back into AIR. */
function verifyClimbPlaneAndDetach() {
	const orot = revealPlatformFoundation({ y: 3 });
	orot.environment.setClimbable(true, true);
	orot.input.setMoveAxis(0.5, 1);
	orot.input.press(PLATFORM_ACTION.ACTION);
	const entry = orot.solver.update(1 / 60);
	assert.equal(entry.mode, "climb");
	assert.equal(orot.locomotion.mode, LOCOMOTION_MODE.CLIMB);
	assert.ok(orot.body.velocityY > 0);
	orot.input.release(PLATFORM_ACTION.ACTION);
	orot.solver.update(1 / 60);
	orot.input.press(PLATFORM_ACTION.ACTION);
	assert.equal(orot.solver.update(1 / 60).outcome.sideSwapped, true);
	assert.equal(orot.environment.climbPlane, -1);
	orot.input.press(PLATFORM_ACTION.JUMP);
	const detach = orot.solver.update(1 / 60);
	assert.equal(detach.outcome.detached, true);
	assert.equal(orot.locomotion.mode, LOCOMOTION_MODE.AIR);
	assert.ok(orot.body.velocityY > 0);
}

/** Proves non-Sulam walls grant nothing while authored Sulam contact creates readable wall-slide behavior. */
function verifySulamWallSlideOnlyWhenAuthored() {
	const plainOrot = revealPlatformFoundation({ y: 5 });
	plainOrot.body.grounded = false;
	plainOrot.body.velocityY = -10;
	const plainOutcome = plainOrot.solver.update(1 / 60);
	assert.notEqual(plainOutcome.mode, "wall");

	const sulamOrot = revealPlatformFoundation({ y: 5 });
	sulamOrot.body.grounded = false;
	sulamOrot.body.velocityY = -10;
	sulamOrot.environment.setSulamWall(1, false);
	const sulamOutcome = sulamOrot.solver.update(1 / 60);
	assert.equal(sulamOutcome.mode, "wall");
	assert.ok(sulamOrot.body.velocityY >= -PLATFORM_MOTION.wallSlideSpeed);
}

/** Proves wall jump pushes away/up, while wall-running requires authored permission plus charged Ratzo and toward-wall run intent. */
function verifySulamJumpAndRatzoRun() {
	const jumpOrot = revealPlatformFoundation({ y: 5 });
	jumpOrot.body.grounded = false;
	jumpOrot.environment.setSulamWall(1, true);
	jumpOrot.input.press(PLATFORM_ACTION.JUMP);
	const wallJump = jumpOrot.solver.update(1 / 60);
	assert.equal(wallJump.outcome.wallJump, true);
	assert.ok(jumpOrot.body.velocityX < 0);
	assert.ok(jumpOrot.body.velocityY > 0);

	const runOrot = revealPlatformFoundation();
	runOrot.input.setMoveAxis(1, 0);
	runOrot.input.press(PLATFORM_ACTION.RUN);
	advancePlatformFrames(runOrot, 60);
	assert.equal(runOrot.locomotion.netzachRatzo.charged, true);
	runOrot.body.y = 4;
	runOrot.body.grounded = false;
	runOrot.body.velocityY = -2;
	runOrot.environment.setSulamWall(1, true);
	const wallRun = runOrot.solver.update(1 / 60);
	assert.equal(wallRun.outcome.wallRun, true);
	assert.ok(runOrot.body.velocityY > 0);
}

test("water owns overlap priority and jump becomes a swim stroke", verifyWaterPriorityAndStroke);
test("swim strokes require a new press edge and cooldown", verifySwimStrokeEdges);
test("climbing supports plane swap and jump detachment", verifyClimbPlaneAndDetach);
test("only authored Sulam contact grants wall slide", verifySulamWallSlideOnlyWhenAuthored);
test("Sulam wall jump and charged Ratzo wall-run obey their gates", verifySulamJumpAndRatzoRun);
