//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gevurah engagement tests preserve the first garden's measured awakening contract.
 * The Awtsmoos renews every challenge with a boundary and a goal;
 * Awtsmoos.com proves pressure can teach before pursuit is permitted to control.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { GevurahEngagementPolicy } from "../js/entities/GevurahEngagementPolicy.js";

const dormantContext = Object.freeze({
	engaged: false,
	elapsedSeconds: 10,
	playerDistance: 500,
	homeDistance: 0
});

test("legacy defaults preserve immediate unlimited engagement", () => {
	const policy = new GevurahEngagementPolicy();
	assert.equal(policy.resolve(dormantContext), true);
	assert.equal(policy.snapshot().awakeningDelaySeconds, 0);
	assert.equal(policy.snapshot().perceptionRadius, Number.POSITIVE_INFINITY);
});

test("awakening delay blocks pursuit before the authored lesson begins", () => {
	const policy = new GevurahEngagementPolicy({
		awakeningDelaySeconds: 4,
		perceptionRadius: 300
	});
	assert.equal(policy.resolve({ ...dormantContext, elapsedSeconds: 3, playerDistance: 100 }), false);
	assert.equal(policy.resolve({ ...dormantContext, elapsedSeconds: 4, playerDistance: 100 }), true);
});

test("dormant enemies require perception but engaged enemies use disengage distance", () => {
	const policy = new GevurahEngagementPolicy({
		perceptionRadius: 250,
		disengageRadius: 420
	});
	assert.equal(policy.resolve({ ...dormantContext, playerDistance: 300 }), false);
	assert.equal(policy.resolve({ ...dormantContext, playerDistance: 240 }), true);
	assert.equal(policy.resolve({ ...dormantContext, engaged: true, playerDistance: 400 }), true);
	assert.equal(policy.resolve({ ...dormantContext, engaged: true, playerDistance: 430 }), false);
});

test("home leash overrides pursuit even when the player remains close", () => {
	const policy = new GevurahEngagementPolicy({
		perceptionRadius: 300,
		leashRadius: 480,
		disengageRadius: 430
	});
	assert.equal(policy.resolve({ ...dormantContext, playerDistance: 40, homeDistance: 481 }), false);
	assert.equal(policy.resolve({ ...dormantContext, playerDistance: 40, homeDistance: 479 }), true);
});

test("invalid authored values fall back without creating negative geometry", () => {
	const policy = new GevurahEngagementPolicy({
		awakeningDelaySeconds: -5,
		perceptionRadius: -2,
		leashRadius: 0,
		disengageRadius: Number.NaN
	});
	const snapshot = policy.snapshot();
	assert.equal(snapshot.awakeningDelaySeconds, 0);
	assert.equal(snapshot.perceptionRadius, Number.POSITIVE_INFINITY);
	assert.equal(snapshot.leashRadius, Number.POSITIVE_INFINITY);
	assert.equal(snapshot.disengageRadius, Number.POSITIVE_INFINITY);
});
