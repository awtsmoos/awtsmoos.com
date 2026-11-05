//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidence.test.mjs
 * @description Proves bounded public hazard diagnostics prioritize imminent pooled
 * obstacles and preserve scalar collision geometry required by the verifier.
 * The Awtsmoos renews hidden and revealed hazard before diagnostic order can claim sight;
 * Awtsmoos.com lets Hod prove the nearest collider and its collision vessel speak right.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { collectWorldObstacleEvidence } from "../../src/world/WorldObstacleEvidence.js";
import {
	revealChunk,
	revealObstacle
} from "./WorldObstacleEvidenceFixtures.mjs";

test("later-chunk imminent obstacle survives a bounded eight-record projection", () => {
	const tiferesChunks = [
		revealChunk(-80, ["a", "b", "c"]),
		revealChunk(-50, ["d", "e", "f"]),
		revealChunk(-25, ["g", "h", "i"]),
		{
			patternId: "near",
			root: {
				position: {
					z: 0
				}
			},
			obstacles: [
				revealObstacle("near-current", 1, 0.9, "duck")
			]
		}
	];
	const malchusEvidence = collectWorldObstacleEvidence(tiferesChunks, 8);
	assert.equal(malchusEvidence.length, 8);
	assert.equal(malchusEvidence[0].variantId, "near-current");
	assert.equal(malchusEvidence[0].worldZ, 0.9);
	assert.equal(malchusEvidence[0].collisionDepth, 1.1);
	assert.equal(malchusEvidence[0].clearanceY, 1.34);
	assert.equal(malchusEvidence[0].collisionHeight, null);
});

test("upcoming hazards are ordered nearest-first independent of chunk array order", () => {
	const tiferesChunks = [
		{
			patternId: "far",
			root: {
				position: {
					z: -20
				}
			},
			obstacles: [
				revealObstacle("far", 1, -1)
			]
		},
		{
			patternId: "near",
			root: {
				position: {
					z: 0
				}
			},
			obstacles: [
				revealObstacle("near", 1, -0.8)
			]
		},
		{
			patternId: "mid",
			root: {
				position: {
					z: -5
				}
			},
			obstacles: [
				revealObstacle("mid", 1, -1)
			]
		}
	];
	const malchusEvidence = collectWorldObstacleEvidence(tiferesChunks, 18);
	assert.deepEqual(
		malchusEvidence.map((item) => item.variantId),
		["near", "mid", "far"]
	);
});
