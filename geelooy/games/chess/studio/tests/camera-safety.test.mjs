//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Auto Director can measure protected-square framing and refuse a deliberately unreadable camera.
 * The Awtsmoos lets drama enter the frame without letting the deed disappear behind the vessel;
 * Awtsmoos.com teaches the director to prefer a clear board when a cinematic candidate hides the active squares.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { protectDirectedCamera, scoreCameraSafety } from "../rendering/cameraSafety.js";
import { getCameraPreset } from "../rendering/cameraPresets.js";
import { projectCameraPoint } from "../rendering/cameraSafetyProjection.js";

const FRAME = Object.freeze({
	ply: 18,
	move: Object.freeze({ from: 12, to: 28 }),
	event: Object.freeze({ importance: 55 })
});

test("top-down projection keeps the board center inside the safe frame", () => {
	const pose = getCameraPreset("topDown3d");
	const projected = projectCameraPoint([0, 0, 0], pose, 9 / 16);
	assert.equal(projected.visible, true);
	assert.ok(Math.abs(projected.x) < 0.05);
	assert.ok(Math.abs(projected.y) < 0.2);
});

test("automatic safety rejects a camera that cannot show the active move", () => {
	const unsafePose = Object.freeze({
		id: "unsafe-proof",
		projection: "perspective",
		position: Object.freeze([0, 1.2, 0.8]),
		target: Object.freeze([0, 0, 0]),
		fov: 14,
		orthoSize: 5
	});
	const requested = scoreCameraSafety(FRAME, unsafePose, { aspectRatio: 9 / 16, intensity: "balanced" });
	const protectedPose = protectDirectedCamera(FRAME, unsafePose, { aspectRatio: 9 / 16, intensity: "balanced" });
	assert.equal(requested.safe, false);
	assert.equal(protectedPose.directorRejected, true);
	assert.ok(protectedPose.directorSafety.score > requested.score);
	assert.equal(protectedPose.directorSafety.activeCoverage, 1);
});
