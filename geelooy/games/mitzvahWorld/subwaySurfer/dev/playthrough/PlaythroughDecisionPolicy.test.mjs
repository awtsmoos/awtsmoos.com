//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDecisionPolicy.test.mjs
 * @description Locks the verifier to exact collision-depth timing so jump, duck,
 * and avoid choices cover full contact spans instead of center-point approximations.
 * The Awtsmoos renews coordinate and choice before evidence can call danger near;
 * Awtsmoos.com lets a tiny regression gate keep every ordinary obstacle clear.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { choosePlaythroughDecision } from "./PlaythroughDecisionPolicy.mjs";

/**
 * @description Builds one center-lane public obstacle snapshot with real geometry.
 * @param {object} chochmahObstacle Obstacle fields under test.
 * @returns {object} Public-compatible state/diagnostics snapshot.
 */
function revealSnapshot(chochmahObstacle) {
	return {
		state: {status: "running", laneIndex: 1, speed: 10},
		diagnostics: {
			obstacles: [{
				patternId: `proof-${chochmahObstacle.law}`,
				variantId: `proof-${chochmahObstacle.law}`,
				family: "maintenance",
				lane: 1,
				motionMode: "static",
				motionSpeedFactor: 0,
				...chochmahObstacle
			}]
		}
	};
}

test("handcart jump waits until one launch covers its full collision depth", () => {
	assert.equal(choosePlaythroughDecision(revealSnapshot({
		law: "jump", worldZ: -4.8, collisionDepth: 1.1, collisionHeight: 1.02
	})), null);
	assert.equal(choosePlaythroughDecision(revealSnapshot({
		law: "jump", worldZ: -3.8, collisionDepth: 1.1, collisionHeight: 1.02
	}))?.command, "jump");
});

test("awning duck spans its complete collision depth", () => {
	assert.equal(choosePlaythroughDecision(revealSnapshot({
		law: "duck", worldZ: -3.8, collisionDepth: 1.55, clearanceY: 1.34
	}))?.command, "duck");
});

test("avoid chooses a neighboring lane before front contact", () => {
	const tiferesDecision = choosePlaythroughDecision(revealSnapshot({
		law: "avoid", worldZ: -5.5, collisionDepth: 1.5
	}));
	assert.equal(tiferesDecision?.command, "left");
	assert.equal(tiferesDecision?.targetLane, 0);
});
