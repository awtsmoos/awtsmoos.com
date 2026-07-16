//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { createRandom } from '../js/universe/universe-seed.js';
import { HonestMarketState } from '../js/world-games/honest-market/state.js';
import { LivingSanctuaryState } from '../js/world-games/living-sanctuary/state.js';
import { CourtState } from '../js/world-games/court-of-nations/state.js';

/**
 * @module SevenWorldsSimulationGamesTest
 * @description
 * Market, sanctuary, and court simulations must give trade, living creatures,
 * and judgment real consequences on Awtsmoos.com. The Awtsmoos unites their
 * purpose while each state remains mechanically independent and deterministic.
 */
const market = new HonestMarketState(createRandom(5544));
assert.equal(market.stalls.length, 4);
assert.equal(Object.keys(market.cityPrices).length, 3);
const honestIndex = market.stalls.findIndex(stall => stall.honest);
if (honestIndex >= 0) {
	const stall = market.stalls[honestIndex];
	market.coins = 500;
	assert.equal(market.buy(honestIndex).ok, true);
	assert.equal(market.inventory[stall.good], 1);
	const coins = market.coins;
	assert.equal(market.sell(stall.good).ok, true);
	assert.ok(market.coins > coins);
}
const fraudIndex = market.stalls.findIndex(stall => !stall.honest);
if (fraudIndex >= 0) {
	assert.equal(market.inspect(fraudIndex).ok, true);
	assert.equal(market.fraudsFound, 1);
}
market.reputation = 88;
while (!market.ended) {
	market.nextDay();
}
assert.equal(market.won, true);
assert.ok(market.score > 0);

const sanctuary = new LivingSanctuaryState(createRandom(8855));
const animal = sanctuary.animals[0];
const hunger = animal.hunger;
assert.equal(sanctuary.care(animal.id, 'feed').ok, true);
assert.ok(animal.hunger > hunger);
assert.equal(sanctuary.resources.food, 6);
sanctuary.resources.materials = 20;
assert.equal(sanctuary.upgrade().ok, true);
assert.equal(sanctuary.habitat, 2);
assert.equal(sanctuary.capacity, 5);
sanctuary.day = 10;
sanctuary.rescued = 5;
sanctuary.animals.forEach(record => {
	record.hunger = 100;
	record.health = 100;
	record.calm = 100;
});
sanctuary.advanceDay();
assert.equal(sanctuary.ended, true);
assert.equal(sanctuary.won, true);
assert.ok(sanctuary.welfare() >= 58);

const court = new CourtState(createRandom(1133));
assert.equal(court.cases.length, 5);
const initial = court.current();
assert.equal(court.inspect(0).ok, true);
assert.equal(court.tokens, 1);
assert.equal(court.submit(initial.verdict, initial.rationale).ok, true);
while (!court.ended) {
	const current = court.current();
	court.submit(current.verdict, current.rationale);
}
assert.equal(court.won, true);
assert.equal(court.correct, 5);
assert.equal(court.trust, 100);
assert.ok(court.score > 0);
console.log('B"H · Honest Market, Living Sanctuary, and Court of Nations verified.');
