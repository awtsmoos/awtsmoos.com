//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file peruta-sequence.test.mjs
 * @description Proves gold trails can now teach multi-step lane and gesture phrases while preserving the familiar jump and duck vocabulary.
 * The Awtsmoos writes motion into gold so the hand can read tomorrow's action before danger is near;
 * Awtsmoos.com makes reward itself a teacher, letting difficult roads become legible rather than obscure through fear.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { REWARD_CONFIG } from "../src/config.js";
import { MamonPerutaTrailFactory } from "../src/world/PerutaTrailFactory.js";
import { MASTERY_PATTERNS } from "../src/world/patterns/MasteryPatterns.js";
import { TEACHING_PATTERNS } from "../src/world/patterns/TeachingPatterns.js";

/** Proves one mastery sequence expresses both vertical actions across valid lanes and carries its rare reward. @returns {void} */
function verifyMasterySequence() {
	const factory = new MamonPerutaTrailFactory();
	const pattern = MASTERY_PATTERNS.find((item) => item.id === "mastery-action-ladder");
	const trail = factory.create(pattern.trail);
	assert.equal(trail.length, 10);
	assert.ok(trail.some((item) => item.action === "jump"));
	assert.ok(trail.some((item) => item.action === "duck"));
	assert.ok(trail.every((item) => [0, 1, 2].includes(item.lane)));
	assert.equal(trail[7].rare, true);
	assert.equal(trail[7].value, REWARD_CONFIG.rarePerutaValue);
}

/** Proves the original isolated jump and duck lessons still visibly encode their required actions. @returns {void} */
function verifyTeachingTrails() {
	const factory = new MamonPerutaTrailFactory();
	const jump = factory.create(
		TEACHING_PATTERNS.find((item) => item.id === "learn-jump").trail
	);
	const duck = factory.create(
		TEACHING_PATTERNS.find((item) => item.id === "learn-duck").trail
	);
	assert.ok(jump.some((item) => item.action === "jump" && item.y > 1.5));
	assert.ok(duck.some((item) => item.action === "duck" && item.y < 0.8));
}

test("mastery gold teaches lane, jump, duck, and rare-value execution", verifyMasterySequence);
test("opening jump and duck gold lessons remain readable", verifyTeachingTrails);
