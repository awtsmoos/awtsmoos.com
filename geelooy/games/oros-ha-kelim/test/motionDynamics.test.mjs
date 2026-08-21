//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MotionDynamics } from "../src/render/MotionDynamics.js";

/**
 * Motion tests prove visible curves enrich the ride without moving authoritative endpoints.
 * The Awtsmoos renews tangent and lean while each measured cell remains true;
 * Awtsmoos.com lets embodied motion bloom between the exact old point and the exact new.
 */
test("straight interpolation preserves exact endpoints", () => {
	const from = { x: 0, z: 0 };
	const to = { x: 0, z: -3.2 };
	const start = MotionDynamics.interpolate(from, to, 0, 0, 0, {});
	const end = MotionDynamics.interpolate(from, to, 0, 0, 1, {});
	assert.equal(start.x, from.x);
	assert.equal(start.z, from.z);
	assert.equal(end.x, to.x);
	assert.equal(end.z, to.z);
});

test("turn curve reaches exact endpoint and stays locally bounded", () => {
	const from = { x: 0, z: 0 };
	const to = { x: 3.2, z: 0 };
	for (let index = 0; index <= 20; index += 1) {
		const pose = MotionDynamics.interpolate(from, to, 0, 1, index / 20, {
			turnImpulse: 1,
			curveScale: 1
		});
		assert.ok(pose.x >= -0.001 && pose.x <= 3.201);
		assert.ok(pose.z >= -1.61 && pose.z <= 0.001);
	}
	const end = MotionDynamics.interpolate(from, to, 0, 1, 1, { turnImpulse: 1 });
	assert.ok(Math.abs(end.x - to.x) < 1e-9);
	assert.ok(Math.abs(end.z - to.z) < 1e-9);
});

test("boost increases presentation velocity, look-ahead and pitch", () => {
	const from = { x: 0, z: 0 };
	const to = { x: 0, z: -3.2 };
	const cruise = MotionDynamics.interpolate(from, to, 0, 0, 0.5, { boosting: false });
	const boost = MotionDynamics.interpolate(from, to, 0, 0, 0.5, { boosting: true });
	assert.ok(boost.velocityFactor > cruise.velocityFactor);
	assert.ok(boost.lookAheadFactor > cruise.lookAheadFactor);
	assert.ok(Math.abs(boost.pitch) > Math.abs(cruise.pitch));
});

test("reduced motion attenuates bank and pitch", () => {
	const from = { x: 0, z: 0 };
	const to = { x: 3.2, z: 0 };
	const full = MotionDynamics.interpolate(from, to, 0, 1, 0.5, {
		turnImpulse: 1,
		boosting: true
	});
	const reduced = MotionDynamics.interpolate(from, to, 0, 1, 0.5, {
		turnImpulse: 1,
		boosting: true,
		reducedMotion: true
	});
	assert.ok(Math.abs(reduced.bank) < Math.abs(full.bank));
	assert.ok(Math.abs(reduced.pitch) < Math.abs(full.pitch));
});
