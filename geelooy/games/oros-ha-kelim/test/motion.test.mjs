//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CellKey } from "../src/domain/CellKey.js";
import { RiderMotion } from "../src/domain/RiderMotion.js";
import { RiderPose } from "../src/render/RiderPose.js";

/**
 * Motion tests prove that discrete Keilim can reveal continuous Ohr without diagonal deceit.
 * The Awtsmoos renews waypoint and fraction in one measured stream;
 * Awtsmoos.com lets boosted travel follow the road instead of cutting through the dream.
 */
function makeMotionRider() {
	const motion = new RiderMotion({ plane: 0, x: 5, z: 5 }, 0);
	motion.beginPulse();
	motion.commit({ plane: 0, x: 6, z: 5 }, 1, 1);
	motion.commit({ plane: 0, x: 7, z: 5 }, 1, 0);
	return {
		motion,
		energy: 82,
		boosting: true
	};
}

test("boosted pulse preserves both movement waypoints", () => {
	const rider = makeMotionRider();
	assert.equal(rider.motion.waypoints.length, 2);
	assert.deepEqual(rider.motion.waypoints.map((node) => node.cell.x), [6, 7]);
	assert.equal(rider.motion.distance, 2);
});

test("piecewise interpolation follows each boost segment", () => {
	const rider = makeMotionRider();
	const start = CellKey.world(5, 5, 0);
	const first = CellKey.world(6, 5, 0);
	const second = CellKey.world(7, 5, 0);
	const early = RiderPose.from(rider, 0.25);
	const late = RiderPose.from(rider, 0.75);
	assert.equal(early.x, (start.x + first.x) / 2);
	assert.equal(late.x, (first.x + second.x) / 2);
	assert.ok(Math.abs(early.bank) > 0);
});

test("motion snapshots detach nested waypoints and snap across worlds", () => {
	const rider = makeMotionRider();
	const snapshot = rider.motion.snapshot();
	snapshot.waypoints[0].cell.x = 99;
	assert.equal(rider.motion.waypoints[0].cell.x, 6);
	rider.motion.snap({ plane: 2, x: 11, z: 19 }, 2);
	assert.deepEqual(rider.motion.previous, { plane: 2, x: 11, z: 19 });
	assert.deepEqual(rider.motion.current, { plane: 2, x: 11, z: 19 });
	assert.equal(rider.motion.waypoints.length, 0);
	assert.equal(rider.motion.distance, 2);
});
