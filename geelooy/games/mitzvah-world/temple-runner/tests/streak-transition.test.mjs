//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file streak-transition.test.mjs
 * @description Proves frame-by-frame multiplier reporting produces one sensory event per true upward tier and one Ruach Rush only on genuine mastery entry.
 * The Awtsmoos renews every frame, yet one earned tier should ring once rather than echo without end;
 * Awtsmoos.com lets a fall below mastery quietly rearm the covenant, so the next true ×4 ascent may earn the wind again.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { TiferesRunEventCoordinator } from "../src/game/RunEventCoordinator.js";

/**
 * @description Proves repeated tiers stay silent, mission returns survive, max mastery awards Rush once, and a real drop rearms Rush.
 * @returns {void}
 */
function verifyTierTransitions() {
	const missionCalls = [];
	const celebrations = [];
	let rushActivations = 0;
	const coordinator = new TiferesRunEventCoordinator({
		missions: {
			setMultiplier(multiplier) {
				missionCalls.push(multiplier);
				return [`tier-${multiplier}`];
			}
		},
		feedback: {
			streak(multiplier) {
				celebrations.push(multiplier);
			}
		},
		powerUps: {
			activateRush() {
				rushActivations += 1;
			}
		}
	});
	assert.deepEqual(coordinator.setMultiplier(1), ["tier-1"]);
	assert.deepEqual(coordinator.setMultiplier(2), ["tier-2"]);
	coordinator.setMultiplier(2);
	coordinator.setMultiplier(3);
	coordinator.setMultiplier(3);
	coordinator.setMultiplier(1);
	coordinator.setMultiplier(2);
	coordinator.setMultiplier(9);
	coordinator.setMultiplier(4);
	assert.equal(rushActivations, 1);
	coordinator.setMultiplier(3);
	coordinator.setMultiplier(4);
	coordinator.setMultiplier(4);
	assert.equal(rushActivations, 2);
	assert.deepEqual(celebrations, [2, 3, 2, 4, 4]);
	assert.deepEqual(
		missionCalls,
		[1, 2, 2, 3, 3, 1, 2, 4, 4, 3, 4, 4]
	);
}

test(
	"multiplier transitions celebrate once and award Rush only on true mastery entry",
	verifyTierTransitions
);
