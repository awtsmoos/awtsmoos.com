//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file camera.test.mjs
 * @description Proves readable world scale, centered edges, bounded anticipation, and adaptive catch-up.
 * The Awtsmoos is beyond near and far while every viewpoint is renewed in His light;
 * Awtsmoos.com tests the finite frame so camera scale and pursuit keep the traveler in sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { CameraFramingPolicy } from "../src/render/camera/CameraFramingPolicy.js";
import { CameraResponsePolicy } from "../src/render/camera/CameraResponsePolicy.js";
import { CameraRig } from "../src/render/CameraRig.js";

const LEVEL = Object.freeze({ width: 36, height: 12 });
const DESKTOP = Object.freeze({ width: 1440, height: 689, fov: Math.PI / 3 });
const PORTRAIT = Object.freeze({ width: 390, height: 844, fov: Math.PI / 3 });

function player(overrides = {}) {
	return {
		x: 8,
		y: 2,
		width: 0.62,
		height: 0.86,
		vx: 0,
		vy: 0,
		onGround: true,
		...overrides
	};
}

test("spawn framing stays on actual player center instead of an inward level margin", () => {
	const policy = new CameraFramingPolicy();
	const body = player({ x: 2.18 });
	const center = [body.x + body.width / 2, body.y + body.height / 2 + 0.82];
	const target = policy.target(body, LEVEL, center, DESKTOP);
	assert.ok(Math.abs(target.x - center[0]) < 0.01);
	assert.ok(Math.abs(target.x - (body.x + 3)) > 1);
});

test("desktop world span is tighter while portrait keeps enough horizontal runway", () => {
	const policy = new CameraFramingPolicy();
	const desktop = policy.profile(DESKTOP);
	const portrait = policy.profile(PORTRAIT);
	assert.equal(desktop.worldSpan, 23);
	assert.equal(portrait.worldSpan, 10.5);
	assert.ok(desktop.depth > 9 && desktop.depth < 10.5);
	assert.ok(portrait.depth > 18 && portrait.depth <= 21);
});

test("look-ahead remains bounded and changes direction with velocity", () => {
	const policy = new CameraFramingPolicy();
	const still = player();
	const center = [still.x + still.width / 2, 3.3];
	const right = policy.target(player({ vx: 7.7 }), LEVEL, center, DESKTOP);
	const left = policy.target(player({ vx: -7.7 }), LEVEL, center, DESKTOP);
	assert.ok(right.x > left.x);
	assert.ok(Math.abs(right.x - center[0]) <= right.profile.lookAhead + 0.01);
	assert.ok(Math.abs(left.x - center[0]) <= left.profile.lookAhead + 0.01);
});

test("horizontal response grows with player speed and framing error", () => {
	const response = new CameraResponsePolicy();
	const idle = response.horizontal(player(), 5, 5.2);
	const running = response.horizontal(player({ vx: 7.7 }), 5, 6.2);
	assert.ok(running > idle * 1.5);
});

test("camera rig snaps discontinuities and looks through its own focus", () => {
	const calls = [];
	const vessel = {
		viewport: () => DESKTOP,
		lookAt: (position, target) => calls.push({ position, target })
	};
	const rig = new CameraRig();
	const body = player();
	rig.load(LEVEL, body, DESKTOP);
	body.x = 24;
	rig.update(vessel, body, 1 / 60);
	const last = calls.at(-1);
	assert.equal(last.position[0], last.target[0]);
	assert.equal(last.position[1], last.target[1]);
	assert.ok(Math.abs(last.target[0] - (body.x + body.width / 2)) < 1);
});
