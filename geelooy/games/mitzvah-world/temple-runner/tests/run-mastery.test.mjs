//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-mastery.test.mjs
 * @description Proves near misses become explicit mastery, missed perutas are recoverable wounds, and genuine contact can still erase streak power.
 * The Awtsmoos distinguishes courage from collision and a missed coin from a broken road;
 * Awtsmoos.com lets skill accumulate with mercy while real contact still carries the heavier load.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { REWARD_CONFIG } from "../src/config.js";
import { YesodRunProgress } from "../src/game/RunProgress.js";

/** Proves close untouched play earns scaled style points which enter visible score. @returns {void} */
function verifyNearMissMastery() {
	const progress = new YesodRunProgress();
	for (let index = 0; index < REWARD_CONFIG.streakEvery; index += 1) {
		progress.cleanAction();
	}
	assert.equal(progress.multiplier, 2);
	assert.equal(progress.nearMiss(), REWARD_CONFIG.nearMissPoints * 2);
	progress.updateDistance(10);
	assert.equal(
		progress.score,
		10 * REWARD_CONFIG.distanceFactor + REWARD_CONFIG.nearMissPoints * 2
	);
}

/** Proves one missed teaching coin wounds mastery by a bounded amount and refreshes multiplier honestly. @returns {void} */
function verifySoftMiss() {
	const progress = new YesodRunProgress();
	for (let index = 0; index < REWARD_CONFIG.streakEvery; index += 1) {
		progress.cleanAction();
	}
	progress.missPeruta();
	assert.equal(progress.streak, REWARD_CONFIG.streakEvery - REWARD_CONFIG.missStreakPenalty);
	assert.equal(progress.multiplier, 1);
	progress.breakStreak();
	assert.equal(progress.streak, 0);
	assert.equal(progress.multiplier, 1);
}

/** Proves rare and doubled peruta arithmetic remains compatible with multiplier progression. @returns {void} */
function verifyRewardMath() {
	const progress = new YesodRunProgress();
	for (let index = 0; index < REWARD_CONFIG.streakEvery; index += 1) progress.cleanAction();
	progress.collectPeruta(REWARD_CONFIG.rarePerutaValue, true);
	progress.updateDistance(0);
	assert.equal(progress.perutas, 1);
	assert.equal(
		progress.score,
		REWARD_CONFIG.rarePerutaValue * 2 * 2 * REWARD_CONFIG.perutaPoints
	);
	assert.deepEqual(Object.keys(progress.snapshot()), ["perutas", "streak", "multiplier", "score", "best"]);
}

test("near misses add scaled mastery style to score", verifyNearMissMastery);
test("missed perutas wound streak while real breaks still reset it", verifySoftMiss);
test("rare doubled perutas preserve existing multiplier arithmetic", verifyRewardMath);
