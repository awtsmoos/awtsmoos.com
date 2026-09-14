//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeEzTreeParity.test.mjs
 * @description Locks the known EZ-Tree 2.0 capability floor beneath the Awtsmoos canonical renderer-neutral tree engine.
 * The test does not compare pixels; it proves that every meaningful upstream behavior has an explicit Awtsmoos structural or dynamic equivalent.
 */

import assert from "node:assert/strict";
import {
	buildTreeGeometryFromSkeleton,
	createTreeWindRig,
	generateTreeLods,
	generateTreeSkeleton,
	getTreeCapabilities,
	getTreePreset,
	sampleTreeWindRig
} from "../src/exports/vegetation.js";

const requiredSupport = Object.freeze([
	"multi-level-branches",
	"force",
	"gnarliness",
	"taper",
	"twist",
	"bounded-trellis-attraction",
	"stable-skeleton-lods",
	"stratified-permuted-attachment-sampling",
	"interpolated-branch-attachments",
	"radius-scaled-bark-uvs",
	"rounded-leaf-normals",
	"lod-billboard-overrides",
	"renderer-neutral-raw-geometry",
	"caller-supplied-material-identities",
	"renderer-neutral-hierarchical-wind-dynamics"
]);

const capabilities = getTreeCapabilities();
for (const feature of requiredSupport) {
	assert.ok(
		capabilities.supports.includes(feature),
		`missing EZ-Tree parity feature: ${feature}`
	);
}

const skeleton = generateTreeSkeleton("Oak Medium");
const lods = generateTreeLods("Oak Medium", {
	profiles: ["high", "medium", "low"]
});

assert.ok(lods.lods.every(lod => lod.skeletonHash === skeleton.contentHash));
assert.ok(lods.lods[0].stats.branchTriangles > lods.lods[2].stats.branchTriangles);
assert.ok(lods.lods[0].stats.leafVertices >= lods.lods[2].stats.leafVertices);

const geometry = buildTreeGeometryFromSkeleton(skeleton, "medium");
assert.ok(geometry.branches.positions.length > 0);
assert.ok(geometry.branches.uvs.some(value => value > 1));
assert.ok(geometry.leaves.normals.some(value => Math.abs(value) > 0.01));

const preset = getTreePreset("Oak Medium");
assert.ok(preset.bark);
assert.ok(preset.leaves);

const rig = createTreeWindRig(skeleton);
const wind = sampleTreeWindRig(rig, 8, {
	direction: [1, 0, 0],
	speedMetersPerSecond: 12,
	gustMetersPerSecond: 18,
	turbulence: 0.55
});

assert.equal(wind.skeletonHash, skeleton.contentHash);
assert.ok(wind.branches.some(branch => Math.hypot(...branch.bend) > 0));
assert.ok(wind.leaves.some(leaf => Math.abs(leaf.flutter) > 0));

console.log('B"H | treeEzTreeParity.test.mjs passed');
