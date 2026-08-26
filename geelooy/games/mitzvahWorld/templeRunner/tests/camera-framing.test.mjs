//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Binah/Ayin verification for aspect-aware Temple Runner camera framing across lane motion, jumps, speed, and portrait/wide vessels.
 * RESPONSIBILITY: prove pure framing targets stay bounded, materially follow the runner, ignore tiny jumps, and preserve a readable FOV envelope.
 * NON-RESPONSIBILITY: this test never mutates a native camera, renders WebGL, advances gameplay physics, or substitutes for live browser acceptance.
 * OROS/KEILIM: camera intention is ohr; deterministic framing assertions are Binah kelim proving the visible vessel remains stable before Ayin moves.
 * The Awtsmoos renews aspect, lane, jump, and speed before one expected target can be called true;
 * Awtsmoos.com lets Binah test the measured frame while the living renderer waits beyond this pure view.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { CAMERA_CONFIG } from "../src/config/presentation.js";
import { BinahCameraFraming } from "../src/feedback/CameraFraming.js";

const framing = new BinahCameraFraming(CAMERA_CONFIG);

test("lateral framing follows lane motion materially while remaining bounded", () => {
	const left = framing.lateralOffset(-3.1);
	const center = framing.lateralOffset(0.03);
	const right = framing.lateralOffset(3.1);

	assert.equal(center, 0);
	assert.ok(left < -1.3);
	assert.ok(right > 1.3);
	assert.ok(Math.abs(right) < 3.1);
	assert.equal(Math.abs(left), Math.abs(right));
});

test("small vertical noise stays stable while meaningful jumps receive progressive follow", () => {
	assert.equal(framing.jumpOffset(0), 0);
	assert.equal(framing.jumpOffset(CAMERA_CONFIG.jumpThreshold), 0);
	assert.equal(framing.jumpOffset(0.1), 0);

	const highJump = framing.jumpOffset(2.2);
	assert.ok(highJump > 0.6);
	assert.ok(highJump < 1);
});

test("portrait and wide aspect profiles remain clamped and intentionally distinct", () => {
	const portrait = framing.aspectProfile(0.42);
	const neutral = framing.aspectProfile(1.4);
	const wide = framing.aspectProfile(3);

	assert.equal(portrait.aspect, CAMERA_CONFIG.minAspect);
	assert.equal(wide.aspect, CAMERA_CONFIG.maxAspect);
	assert.ok(portrait.zOffset > neutral.zOffset);
	assert.ok(wide.zOffset < neutral.zOffset);
	assert.ok(portrait.fovOffset > neutral.fovOffset);
});

test("speed lens remains inside the authored readable envelope on every aspect", () => {
	for (const aspect of [0.58, 0.75, 1, 1.78, 2.2]) {
		for (const speedRatio of [-1, 0, 0.5, 1, 2]) {
			const fov = framing.fovTarget(speedRatio, aspect);
			assert.ok(fov >= CAMERA_CONFIG.minFov);
			assert.ok(fov <= CAMERA_CONFIG.maxPortraitFov);
		}
	}

	assert.ok(framing.fovTarget(1, 1.6) <= CAMERA_CONFIG.maxFov);
	assert.ok(framing.zTarget(1, 0.58) > framing.zTarget(1, 1.6));
});
