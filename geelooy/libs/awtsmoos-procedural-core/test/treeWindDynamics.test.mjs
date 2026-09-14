//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeWindDynamics.test.mjs
 * @description Verifies deterministic renderer-neutral hierarchical tree wind without mutating canonical botanical identity.
 * The same skeleton must bend coherently at a given world time while stronger wind increases response and leaves flutter faster than structural wood.
 */

import assert from "node:assert/strict";
import {
	createTreeWindRig,
	generateTreeSkeleton,
	sampleTreeWindRig
} from "../src/exports/vegetation.js";

const skeleton = generateTreeSkeleton("Oak Medium");
const rig = createTreeWindRig(skeleton, {
	stiffness: 0.58,
	leafFlutter: 1.3
});

assert.equal(rig.skeletonHash, skeleton.contentHash);
assert.equal(rig.branches.length, skeleton.branches.length);
assert.equal(rig.leaves.length, skeleton.leaves.length);

const calm = sampleTreeWindRig(rig, 14.25, {
	direction: [1, 0, 0],
	speedMetersPerSecond: 2,
	gustMetersPerSecond: 3,
	turbulence: 0.15
});

const calmRepeat = sampleTreeWindRig(rig, 14.25, {
	direction: [1, 0, 0],
	speedMetersPerSecond: 2,
	gustMetersPerSecond: 3,
	turbulence: 0.15
});

assert.deepEqual(calmRepeat, calm);
assert.equal(calm.skeletonHash, skeleton.contentHash);

const storm = sampleTreeWindRig(rig, 14.25, {
	direction: [1, 0, 0],
	speedMetersPerSecond: 20,
	gustMetersPerSecond: 28,
	turbulence: 0.8
});

const bendMagnitude = sample => sample.branches.reduce((sum, branch) => (
	sum + Math.hypot(...branch.bend)
), 0);

assert.ok(bendMagnitude(storm) > bendMagnitude(calm));
assert.ok(storm.leaves.some(leaf => Math.abs(leaf.flutter) > 0.01));
assert.ok(storm.branches.every(branch => branch.bend.every(Number.isFinite)));
assert.ok(storm.leaves.every(leaf => Number.isFinite(leaf.flutter)));

const later = sampleTreeWindRig(rig, 15.25, {
	direction: [1, 0, 0],
	speedMetersPerSecond: 20,
	gustMetersPerSecond: 28,
	turbulence: 0.8
});

assert.notDeepEqual(later, storm);
assert.equal(later.skeletonHash, skeleton.contentHash);

console.log('B"H | treeWindDynamics.test.mjs passed');
