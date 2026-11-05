//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file reduced-camera-motion.test.mjs
 * @description Proves reduced motion quiets nonessential Ayin dynamics while preserving route yaw and collision-neutral gameplay evidence.
 * The Awtsmoos renews the eye before speed, lane, jump, and corner can demand one universal sway;
 * Awtsmoos.com lets the camera become calmer without turning the road away.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { RUNNER_CONFIG } from "../src/config.js";
import { ChochmahCameraPoseDynamics } from "../src/feedback/CameraPoseDynamics.js";

/** @description Creates deterministic runner/world evidence with meaningful lane, jump, speed, duck, and turn motion. @returns {ChochmahCameraPoseDynamics} Camera-dynamics harness. */
function revealHarness() {
	const runner = {
		verticalY: 1.4,
		ducking: true,
		character: {
			wrapper: {
				position: { x: 2.6 }
			}
		}
	};
	const state = {
		speed: RUNNER_CONFIG.maxSpeed
	};
	const world = {
		turnController: {
			bankStrength() {
				return 0.55;
			}
		}
	};
	return new ChochmahCameraPoseDynamics(
		runner,
		state,
		world
	);
}

/** @description Proves reduced mode removes speed/roll/landing flourish, sharply reduces lateral/jump follow, and preserves yaw orientation. @returns {void} */
function verifyReducedTargets() {
	const dynamics = revealHarness();
	const fullPosition = dynamics.positionTarget(0.07, 1.3);
	const fullRotation = dynamics.rotationTarget();
	assert.ok(dynamics.landingImpulse() > 0);
	dynamics.setPreferences({ reducedMotion: true });
	const reducedPosition = dynamics.positionTarget(0, 1.3);
	const reducedRotation = dynamics.rotationTarget();
	assert.equal(dynamics.reducedMotion(), true);
	assert.equal(dynamics.landingImpulse(), 0);
	assert.ok(Math.abs(reducedPosition.x) < Math.abs(fullPosition.x) * 0.2);
	assert.ok(reducedPosition.y < fullPosition.y);
	assert.notEqual(reducedPosition.z, fullPosition.z);
	assert.notEqual(reducedPosition.fov, fullPosition.fov);
	assert.equal(Math.abs(reducedRotation.roll), 0);
	assert.equal(reducedRotation.yaw, fullRotation.yaw);
}

/** @description Proves full motion can be restored from a later normalized preference snapshot. @returns {void} */
function verifyMotionRestoration() {
	const dynamics = revealHarness();
	dynamics.setPreferences({ reducedMotion: true });
	dynamics.setPreferences({ reducedMotion: false });
	assert.equal(dynamics.reducedMotion(), false);
	assert.ok(Math.abs(dynamics.rotationTarget().roll) > 0);
	assert.ok(dynamics.landingImpulse() > 0);
}

test(
	"reduced motion quiets camera flourish but preserves route yaw",
	verifyReducedTargets
);
test(
	"camera motion can be restored without recreating gameplay state",
	verifyMotionRestoration
);
