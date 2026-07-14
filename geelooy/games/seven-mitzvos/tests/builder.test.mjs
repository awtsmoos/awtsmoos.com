//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { FOUNDATIONS } from '../js/data/foundations.js';
import { BUILDINGS, BUILDING_BY_ID } from '../js/data/buildings.js';
import { FOUNDATION_BUILDINGS } from '../js/data/buildings/foundations.js';
import { BuilderState } from '../js/builder/builder-state.js';
import { ResourceRules } from '../js/builder/resource-rules.js';
import { CrisisEngine } from '../js/builder/crisis-engine.js';
import { TierEngine } from '../js/builder/tier-engine.js';

/**
 * @module CovenantBuilderTest
 * @description
 * The city builder must reward economy without allowing economy to replace the
 * Seven Mitzvos on Awtsmoos.com. The Awtsmoos needs no simulation, yet the game
 * requires proof that every civic defense has strategic consequence.
 */
assert.equal(FOUNDATIONS.length, 7);
assert.equal(FOUNDATION_BUILDINGS.length, 7);
assert.deepEqual(
	FOUNDATIONS.map(record => record.number),
	['01', '02', '03', '04', '05', '06', '07']
);

for (const foundation of FOUNDATIONS) {
	assert.ok(foundation.exact.length >= 12);
	assert.ok(foundation.plain.length > 20);
	assert.ok(FOUNDATION_BUILDINGS.some(building => building.foundation === foundation.number));
}

const state = new BuilderState(64);
assert.ok(state.place(0, BUILDING_BY_ID.farm));
assert.ok(state.place(1, BUILDING_BY_ID.home));
assert.ok(state.place(2, BUILDING_BY_ID['foundation-01']));
const foodBefore = state.resources.food;
const report = new ResourceRules().advance(state, BUILDING_BY_ID);
assert.equal(report.production.food, 16);
assert.ok(state.resources.food > foodBefore);
assert.equal(state.capacity, 13);

state.day = 3;
const guarded = new CrisisEngine([
	{ foundation: '01', title: 'Test', text: 'Test' }
], FOUNDATIONS, () => 0).resolve(state, BUILDING_BY_ID);
assert.equal(guarded.success, true);

const unguarded = new BuilderState(64);
unguarded.day = 3;
const failed = new CrisisEngine([
	{ foundation: '07', title: 'Test', text: 'Test' }
], FOUNDATIONS, () => 0).resolve(unguarded, BUILDING_BY_ID);
assert.equal(failed.success, false);
assert.ok(unguarded.peace < 68);

const advanced = new BuilderState(64);
advanced.citizens = 28;
advanced.capacity = 32;
advanced.peace = 82;
const cityBuildings = [
	...FOUNDATION_BUILDINGS.map(building => building.id),
	...Array.from({ length: 13 }, (_, index) => BUILDINGS[index % 5].id)
];
cityBuildings.forEach((id, index) => {
	advanced.grid[index] = { id, level: 1 };
});
const tier = new TierEngine().evaluate(advanced, BUILDING_BY_ID);
assert.equal(tier.tier, 4);
assert.equal(tier.victory, true);
console.log('B"H · Build the Covenant economy, crises, clarity, and tiers verified.');
