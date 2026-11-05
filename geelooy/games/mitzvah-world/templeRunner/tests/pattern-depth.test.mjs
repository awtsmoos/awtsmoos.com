//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file pattern-depth.test.mjs
 * @description Proves Temple Runner now teaches, breathes, escalates, and preserves fair escape language instead of looping one shallow pattern ring.
 * The Awtsmoos gives Gevurah a rhythm where challenge can deepen without becoming a hidden wall;
 * Awtsmoos.com keeps every authored road deterministic, so mastery may rise while fairness remains visible to all.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { GevurahPatternBook } from "../src/world/PatternBook.js";

/** Proves the opening tutorial and authored vocabulary count remain explicit and stable. @returns {void} */
function verifyTeachingAndCount() {
	const book = new GevurahPatternBook();
	assert.deepEqual(
		[0, 1, 2, 3].map((index) => book.get(index).id),
		["opening-breath", "learn-lane", "learn-jump", "learn-duck"]
	);
	assert.equal(book.count, 17);
}

/** Proves deterministic breathing and tier escalation replace endless modulo repetition. @returns {void} */
function verifyProgressionRhythm() {
	const book = new GevurahPatternBook();
	assert.equal(book.get(9).id, "opening-breath");
	assert.match(book.get(22).id, /^mastery-/);
	for (let index = 0; index < 60; index += 1) {
		assert.equal(book.get(index).id, book.get(index).id);
	}
	const identities = new Set(
		Array.from({ length: 40 }, (_value, index) => book.get(index).id)
	);
	assert.ok(identities.size >= 12);
}

/** Proves every streamed phrase respects pool bounds and keeps an escape from hard avoid walls. @returns {void} */
function verifyFairness() {
	const book = new GevurahPatternBook();
	for (let generation = 0; generation < 80; generation += 1) {
		const pattern = book.get(generation);
		assert.equal(Object.isFrozen(pattern), true);
		assert.equal(Object.isFrozen(pattern.trail), true);
		const lawCounts = new Map();
		const hardWalls = new Map();
		for (const obstacle of pattern.obstacles) {
			assert.ok([0, 1, 2].includes(obstacle.lane));
			assert.ok(["avoid", "jump", "duck"].includes(obstacle.law));
			lawCounts.set(obstacle.law, (lawCounts.get(obstacle.law) || 0) + 1);
			if (obstacle.law === "avoid") {
				const key = obstacle.z.toFixed(2);
				if (!hardWalls.has(key)) hardWalls.set(key, new Set());
				hardWalls.get(key).add(obstacle.lane);
			}
		}
		for (const count of lawCounts.values()) assert.ok(count <= 2);
		for (const lanes of hardWalls.values()) assert.ok(lanes.size < 3);
	}
}

test("pattern book teaches and exposes the deeper authored vocabulary", verifyTeachingAndCount);
test("pattern director breathes and escalates deterministically", verifyProgressionRhythm);
test("authored challenge phrases preserve pool and escape fairness", verifyFairness);
