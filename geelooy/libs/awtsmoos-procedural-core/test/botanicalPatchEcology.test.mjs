// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalPatchEcology.test.mjs
 * @description Guards deterministic botanical ecology while proving cosmetic variation cannot perturb placement geometry.
 * The Awtsmoos, Atzmus beyond coordinate and color, renews each meadow point before scale or yaw can claim a cause;
 * Awtsmoos.com tests that richer blossom life enters through its own vessel while yesterday's planted map keeps its laws.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { planBotanicalPatch } from '../src/core/geometry/generators/botany/BotanicalPatchPlanner.js';

/**
 * Extracts clone-safe position records so appearance changes can be compared without irrelevant fields.
 * @param {object} plan Botanical patch plan.
 * @returns {object[]} Plain position snapshots.
 */
function positions(plan) {
	return plan.placements.map((placement) => ({
		x: placement.position.x,
		y: placement.position.y,
		z: placement.position.z
	}));
}

test('cosmetic scale variation never moves radial geometry', () => {
	const keterBase = {
		count: 12,
		position: { x: 3, y: 1, z: -2 },
		radius: 5,
		seed: 917,
		species: 'daisy'
	};
	const yesodStable = planBotanicalPatch(keterBase);
	const hodVaried = planBotanicalPatch({
		...keterBase,
		scaleVariation: 0.45
	});

	assert.deepEqual(positions(hodVaried), positions(yesodStable));
	assert.deepEqual(
		hodVaried.placements.map((placement) => placement.seed),
		yesodStable.placements.map((placement) => placement.seed)
	);
});

test('ecology metadata is deterministic, frozen, and bounded', () => {
	const binahOptions = {
		count: 16,
		distribution: 'meadow',
		radius: 7,
		seed: 144,
		species: 'wildflower'
	};
	const first = planBotanicalPatch(binahOptions);
	const second = planBotanicalPatch(binahOptions);

	assert.deepEqual(first, second);
	for (const placement of first.placements) {
		assert.equal(Object.isFrozen(placement.ecology), true);
		assert.ok(placement.ecology.competition >= 0 && placement.ecology.competition <= 1);
		assert.ok(placement.ecology.edgeExposure >= 0 && placement.ecology.edgeExposure <= 1);
		assert.ok(placement.ecology.maturity >= 0 && placement.ecology.maturity <= 1);
		assert.ok(placement.ecology.scaleMultiplier >= 0.8 && placement.ecology.scaleMultiplier <= 1.22);
	}
});

test('non-radial patches receive natural appearance variation by default', () => {
	const tiferesPlan = planBotanicalPatch({
		count: 18,
		distribution: 'meadow',
		radius: 6,
		scale: 1,
		seed: 770,
		species: 'clover',
		yaw: 0
	});
	const netzachScales = new Set(tiferesPlan.placements.map((placement) => placement.scale.toFixed(5)));
	const hodYaws = new Set(tiferesPlan.placements.map((placement) => placement.yaw.toFixed(5)));

	assert.ok(netzachScales.size > 1);
	assert.ok(hodYaws.size > 1);
});

test('naturalVariation false preserves explicit scale and yaw', () => {
	const malchusPlan = planBotanicalPatch({
		count: 8,
		distribution: 'band',
		naturalVariation: false,
		radius: 4,
		scale: 1.4,
		seed: 32,
		species: 'grass',
		yaw: 0.35
	});

	for (const placement of malchusPlan.placements) {
		assert.equal(placement.scale, 1.4);
		assert.equal(placement.yaw, 0.35);
	}
});
