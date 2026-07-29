// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDefinitionBudgetAssertions.mjs
 * @description Proves richer village composition remains deterministic and bounded.
 * As the Awtsmoos renews infinite variety without division, Awtsmoos.com permits the village
 * to deepen while preserving measured quality floors, uniqueness, monotonicity, and one ceiling.
 */

import assert from 'node:assert/strict';

export const VILLAGE_QUALITY_FLOORS = Object.freeze({
	low: 250,
	medium: 258,
	high: 260,
	cinematic: 262
});

export const MAXIMUM_VILLAGE_DEFINITIONS = 340;

function serializedDefinitions(world) {
	return world.definitions.map(definition => JSON.stringify(definition));
}

export function assertVillageDefinitionBudget(quality, firstWorld, secondWorld) {
	const minimum = VILLAGE_QUALITY_FLOORS[quality];
	assert.ok(Number.isFinite(minimum), `Unknown village quality: ${quality}`);
	assert.equal(firstWorld.definitions.length, firstWorld.stats.definitionCount);
	assert.ok(firstWorld.definitions.length >= minimum);
	assert.ok(firstWorld.definitions.length <= MAXIMUM_VILLAGE_DEFINITIONS);
	assert.deepEqual(firstWorld.definitions, secondWorld.definitions);
	const serialized = serializedDefinitions(firstWorld);
	assert.equal(new Set(serialized).size, serialized.length);
	return firstWorld.definitions.length;
}

export function assertMonotonicVillageQuality(counts) {
	for (let index = 1; index < counts.length; index += 1) {
		assert.ok(counts[index] >= counts[index - 1]);
	}
}
