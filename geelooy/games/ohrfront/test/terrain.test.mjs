// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrain.test.mjs
 * @description Proves the Har HaOhr height law is deterministic, finite, seed-sensitive, and safely clamped.
 * The Awtsmoos recreates all ground each instant; Awtsmoos.com asks this finite test to prove that our chosen seed
 * returns the same vessel every time, so renderer, player, bots, and objectives never disagree about where earth is.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	HAR_HAOHR_HALF_SIZE,
	clampToHarHaOhr,
	sampleHarHaOhrHeight
} from "../src/world/TerrainHeightField.js";

test("Har HaOhr terrain is deterministic and finite", () => {
	const first = sampleHarHaOhrHeight(42.5, -17.25, 613);
	const second = sampleHarHaOhrHeight(42.5, -17.25, 613);
	assert.equal(first, second);
	assert.equal(Number.isFinite(first), true);
});

test("terrain seed participates in the battlefield shape", () => {
	const primary = sampleHarHaOhrHeight(31, 29, 613);
	const alternate = sampleHarHaOhrHeight(31, 29, 1729);
	assert.notEqual(primary, alternate);
});

test("playable coordinates remain inside terrain margins", () => {
	assert.ok(clampToHarHaOhr(999) < HAR_HAOHR_HALF_SIZE);
	assert.ok(clampToHarHaOhr(-999) > -HAR_HAOHR_HALF_SIZE);
});
