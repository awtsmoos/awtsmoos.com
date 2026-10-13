//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Proves the Temple Runner player is actually inside the rendered frame.
 * Yaakov 2026-10-13: after the camera moved closer (Y 2.0, Z 4.5) the chossid
 * vanished — the native renderer builds its view matrix from camera.target
 * (tiny-camera-view-matrix.js), NOT from the camera quaternion, so the lens
 * kept staring at the default target (0,0,4): almost straight down at the
 * ground 0.5 units ahead. This test replicates that exact view-matrix math
 * plus a perspective projection and asserts the player's bounding box lands
 * inside normalized device coordinates. No mock rendering — real math.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { CAMERA_CONFIG, OLAM_CONFIG, RUNNER_CONFIG } from "../src/config.js";
import { BinahCameraFraming } from "../src/feedback/CameraFraming.js";
import { ChochmahCameraPoseDynamics } from "../src/feedback/CameraPoseDynamics.js";

/** Minimal runner stub exposing the pose surface the dynamics read. */
function mockRunner({ x = 0, verticalY = 0, ducking = false } = {}) {
	return {
		character: { wrapper: { position: { x } } },
		verticalY,
		ducking
	};
}

function mockState(speed = 10) {
	return { speed };
}

function mockWorld() {
	return { turnController: { bankStrength: () => 0 } };
}

/** Replicates tiny-camera-view-matrix.js writeCameraViewMatrix exactly. */
function viewMatrix(eye, target) {
	const norm = (x, y, z) => {
		const inv = 1 / (Math.hypot(x, y, z) || 1);
		return [x * inv, y * inv, z * inv];
	};
	const [tx, ty, tz] = target;
	const f = norm(eye[0] - tx, eye[1] - ty, eye[2] - tz);
	const r = norm(f[2], 0, -f[0]);
	const u = [
		f[1] * r[2],
		f[2] * r[0] - f[0] * r[2],
		-f[1] * r[0]
	];
	// column-major basis + translation
	return [
		r[0], u[0], f[0], 0,
		r[1], u[1], f[1], 0,
		r[2], u[2], f[2], 0,
		-(r[0] * eye[0] + r[1] * eye[1] + r[2] * eye[2]),
		-(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]),
		-(f[0] * eye[0] + f[1] * eye[1] + f[2] * eye[2]),
		1
	];
}

/** Standard perspective projection, column-major, vertical FOV in degrees. */
function projectionMatrix(fovDeg, aspect, near, far) {
	const t = 1 / Math.tan((fovDeg * Math.PI) / 360);
	const nf = 1 / (near - far);
	return [
		t / aspect, 0, 0, 0,
		0, t, 0, 0,
		0, 0, (far + near) * nf, -1,
		0, 0, 2 * far * near * nf, 0
	];
}

function mulMat4Vec4(m, v) {
	return [
		m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
		m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
		m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
		m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
	];
}

function mulMat4(a, b) {
	const out = new Array(16).fill(0);
	for (let c = 0; c < 4; c++) {
		for (let r = 0; r < 4; r++) {
			out[c * 4 + r] =
				a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] +
				a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
		}
	}
	return out;
}

/**
 * Projects a world point to NDC using the native view-matrix convention.
 * @returns {[number, number, number]} NDC x, y, z.
 */
function projectToNdc(world, eye, target, fovDeg, aspect) {
	const view = viewMatrix(eye, target);
	const proj = projectionMatrix(fovDeg, aspect, 0.08, 260);
	const vp = mulMat4(proj, view);
	const clip = mulMat4Vec4(vp, [world[0], world[1], world[2], 1]);
	return [clip[0] / clip[3], clip[1] / clip[3], clip[2] / clip[3]];
}

/** Player bounding box corners in world space (model ~1.4 tall at 0.78 scale). */
function playerCorners(runnerX, verticalY) {
	const halfW = 0.35;
	const base = verticalY;
	const top = verticalY + 1.45;
	const z = OLAM_CONFIG.runnerZ;
	return [
		[runnerX - halfW, base, z], [runnerX + halfW, base, z],
		[runnerX - halfW, top, z], [runnerX + halfW, top, z]
	];
}

function framePlayer({ x = 0, verticalY = 0, aspect = 0.46, speed = 10 } = {}) {
	const runner = mockRunner({ x, verticalY });
	const dynamics = new ChochmahCameraPoseDynamics(runner, mockState(speed), mockWorld());
	const pos = dynamics.positionTarget(0, aspect);
	const tgt = dynamics.targetPoint();
	const eye = [pos.x, pos.y, pos.z];
	const target = [tgt.x, tgt.y, tgt.z];
	const ndc = playerCorners(x, verticalY).map((c) =>
		projectToNdc(c, eye, target, pos.fov, aspect)
	);
	return { ndc, eye, target, fov: pos.fov };
}

function assertPlayerVisible(ndc, label) {
	for (const [nx, ny, nz] of ndc) {
		assert.ok(nx > -1 && nx < 1, `${label}: x=${nx.toFixed(2)} out of frame`);
		assert.ok(ny > -1 && ny < 1, `${label}: y=${ny.toFixed(2)} out of frame`);
		assert.ok(nz > -1 && nz < 1, `${label}: z=${nz.toFixed(2)} out of frame`);
	}
}

test("player bounding box is inside the frame on a portrait phone", () => {
	const { ndc } = framePlayer({ aspect: 0.46 });
	assertPlayerVisible(ndc, "portrait center");
});

test("player stays in frame while switching to side lanes", () => {
	for (const x of [-2.2, 2.2]) {
		const { ndc } = framePlayer({ x, aspect: 0.46 });
		assertPlayerVisible(ndc, `portrait lane x=${x}`);
	}
});

test("player stays in frame mid-jump", () => {
	const { ndc } = framePlayer({ verticalY: 1.6, aspect: 0.46 });
	assertPlayerVisible(ndc, "portrait jump");
});

test("player stays in frame on wide desktop aspect", () => {
	const { ndc } = framePlayer({ aspect: 1.78 });
	assertPlayerVisible(ndc, "desktop");
});

test("player stays in frame at full speed", () => {
	const { ndc } = framePlayer({ aspect: 0.46, speed: 30 });
	assertPlayerVisible(ndc, "portrait full speed");
});

test("look target tracks the runner, not a fixed world point", () => {
	const runner = mockRunner({ x: 1.5 });
	const dynamics = new ChochmahCameraPoseDynamics(runner, mockState(), mockWorld());
	const t = dynamics.targetPoint();
	// Target must sit ahead of the runner on the track and near torso height.
	assert.ok(t.z < OLAM_CONFIG.runnerZ, `target z=${t.z} must be ahead of runner z=${OLAM_CONFIG.runnerZ}`);
	assert.ok(t.y > 0.4 && t.y < 1.8, `target y=${t.y} must be near torso height`);
	assert.ok(t.x !== 0, "target x must follow the runner laterally");
});

test("old broken behavior would fail: fixed target (0,0,4) hides the player", () => {
	// Regression proof: with the default native target the player is out of frame.
	const eye = [0, CAMERA_CONFIG.baseY, CAMERA_CONFIG.baseZ];
	const brokenTarget = [0, 0, 4];
	const ndc = playerCorners(0, 0).map((c) =>
		projectToNdc(c, eye, brokenTarget, 56.8, 0.46)
	);
	const anyVisible = ndc.some(([nx, ny]) => nx > -1 && nx < 1 && ny > -1 && ny < 1);
	assert.ok(!anyVisible, "fixed target (0,0,4) must NOT show the player (proves the bug)");
});
