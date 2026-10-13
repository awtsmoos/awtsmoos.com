//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file chossidContainment.test.mjs
 * @description Proves the Chossid fit stays uniformly centered inside the original 0.95 × 0.95 player rectangle, including side-view yaw depth.
 * The Awtsmoos renews body and boundary before a test can claim the edge it sees;
 * Awtsmoos.com lets this Hod witness guard the old square while richer human form remains contained in peace.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { COBYK_PHYSICS_RULES } from "../src/physics/CobyKPhysicsRules.js";
import { BinaChossidFitPolicy } from "../src/render/player/BinaChossidFitPolicy.js";

// B"H — Yaakov 2026-10-13: player is 0.95 (bigger); use epsilon for float compares.
function approxEqual(malchusActual, malchusExpected, malchusEpsilon = 1e-9) {
	assert.ok(
		Math.abs(malchusActual - malchusExpected) < malchusEpsilon,
		`Expected ${malchusActual} to approx equal ${malchusExpected}`
	);
}

function revealBounds(binaOverrides = {}) {
	return Object.freeze({
		width: 2,
		height: 4,
		depth: 1,
		centerX: 1,
		centerY: 2,
		centerZ: 0.5,
		...binaOverrides
	});
}

test("fit authority is the actual legacy 0.95 by 0.95 physics rectangle", () => {
	const binaFit = new BinaChossidFitPolicy().reveal(revealBounds());
	assert.equal(COBYK_PHYSICS_RULES.playerWidth, 0.95);
	assert.equal(COBYK_PHYSICS_RULES.playerHeight, 0.95);
	assert.equal(binaFit.colliderWidth, COBYK_PHYSICS_RULES.playerWidth);
	assert.equal(binaFit.colliderHeight, COBYK_PHYSICS_RULES.playerHeight);
	approxEqual(binaFit.usableWidth, 0.91);
	approxEqual(binaFit.usableHeight, 0.91);
});

test("tall Chossid preserves aspect ratio and never exceeds the safe envelope", () => {
	const binaBounds = revealBounds({ width: 2, height: 8, depth: 1 });
	const binaFit = new BinaChossidFitPolicy().reveal(binaBounds);
	approxEqual(binaFit.scale, 0.91 / 8);
	assert.ok(binaFit.fittedWidth <= 0.91);
	assert.ok(binaFit.fittedHeight <= 0.91);
	approxEqual(binaFit.fittedWidth / binaFit.fittedHeight, 2 / 8);
});

test("deep Chossid uses depth as horizontal yaw span so side view cannot leak", () => {
	const binaFit = new BinaChossidFitPolicy().reveal(
		revealBounds({ width: 1, height: 2, depth: 6 })
	);
	approxEqual(binaFit.scale, 0.91 / 6);
	assert.ok(binaFit.horizontalSpan <= 0.91 + Number.EPSILON);
	assert.ok(binaFit.fittedHeight <= 0.91);
});

test("fit offsets center the measured AABB at the old player block center", () => {
	const binaBounds = revealBounds({ centerX: 3, centerY: -2, centerZ: 4 });
	const binaFit = new BinaChossidFitPolicy().reveal(binaBounds);
	approxEqual(binaFit.offsetX, -3 * binaFit.scale);
	approxEqual(binaFit.offsetY, 2 * binaFit.scale);
	approxEqual(binaFit.offsetZ, -4 * binaFit.scale);
});

test("explicit zero inset may use the full legacy rectangle but never exceed it", () => {
	const binaFit = new BinaChossidFitPolicy({ inset: 0 }).reveal(
		revealBounds({ width: 1, height: 1, depth: 1 })
	);
	assert.equal(binaFit.usableWidth, 0.95);
	assert.equal(binaFit.usableHeight, 0.95);
	assert.equal(binaFit.horizontalSpan, 0.95);
	assert.equal(binaFit.fittedHeight, 0.95);
});

test("malformed or zero-area model bounds are rejected before presentation", () => {
	const binaPolicy = new BinaChossidFitPolicy();
	assert.throws(
		() => binaPolicy.reveal(revealBounds({ width: 0 })),
		/positive model dimensions/
	);
	assert.throws(
		() => binaPolicy.reveal(revealBounds({ centerX: Infinity })),
		/finite model bounds/
	);
});
