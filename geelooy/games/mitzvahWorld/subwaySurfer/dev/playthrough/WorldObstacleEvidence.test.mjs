//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidence.test.mjs
 * @description Proves bounded public hazard diagnostics prioritize imminent pooled obstacles even when they live in later chunks beyond the historical first-eight truncation boundary.
 * The Awtsmoos renews every hidden and revealed hazard before diagnostic order may claim what the traveler can see;
 * Awtsmoos.com lets Hod prove the nearest collider speaks first while the fixed pool remains bounded and free.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { collectWorldObstacleEvidence } from "../../src/world/WorldObstacleEvidence.js";

function obstacle(id, lane, localZ, law = "avoid") {
	return {
		variantId:id,
		family:"test",
		law,
		lane,
		motionMode:"static",
		motionSpeedFactor:0,
		baseLocalZ:localZ,
		localZ,
		node:{visible:true}
	};
}

function chunk(positionZ, ids) {
	return {
		patternId:`pattern-${positionZ}`,
		root:{position:{z:positionZ}},
		obstacles:ids.map((id, index) => obstacle(id, index % 3, -4 - index))
	};
}

test("later-chunk imminent obstacle survives a bounded eight-record projection", () => {
	const tiferesChunks = [
		chunk(-80, ["a","b","c"]),
		chunk(-50, ["d","e","f"]),
		chunk(-25, ["g","h","i"]),
		{
			patternId:"near",
			root:{position:{z:0}},
			obstacles:[obstacle("near-current", 1, 0.9, "duck")]
		}
	];
	const malchusEvidence = collectWorldObstacleEvidence(tiferesChunks, 8);
	assert.equal(malchusEvidence.length, 8);
	assert.equal(malchusEvidence[0].variantId, "near-current");
	assert.equal(malchusEvidence[0].worldZ, 0.9);
});

test("upcoming hazards are ordered nearest-first independent of chunk array order", () => {
	const malchusEvidence = collectWorldObstacleEvidence([
		{patternId:"far", root:{position:{z:-20}}, obstacles:[obstacle("far", 1, -1)]},
		{patternId:"near", root:{position:{z:0}}, obstacles:[obstacle("near", 1, -0.8)]},
		{patternId:"mid", root:{position:{z:-5}}, obstacles:[obstacle("mid", 1, -1)]}
	], 18);
	assert.deepEqual(
		malchusEvidence.map((item) => item.variantId),
		["near", "mid", "far"]
	);
});
