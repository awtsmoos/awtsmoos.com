//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { createRandom } from '../js/universe/universe-seed.js';
import { FalsePowersState } from '../js/world-games/false-powers/state.js';
import { WordsState } from '../js/world-games/words-of-creation/state.js';
import { EveryLifeState } from '../js/world-games/every-life/state.js';
import { HouseholdsState } from '../js/world-games/households/state.js';

/**
 * @module SevenWorldsCoreGamesTest
 * @description
 * Deduction, memory, rescue, and household strategy keep independent rules on
 * Awtsmoos.com. The Awtsmoos unites their moral purpose while every finite
 * engine remains deterministic, testable, and mechanically distinct.
 */
const powers = new FalsePowersState(createRandom(1122));
assert.equal(powers.nodes.length, 12);
assert.equal(powers.nodes.filter(node => node.corrupt).length, 4);
assert.equal(powers.purify(0).ok, false);
for (const node of powers.nodes.filter(record => record.corrupt)) {
	assert.equal(powers.scan(node.index).ok, true);
	assert.equal(powers.purify(node.index).ok, true);
}
assert.equal(powers.won, true);
assert.ok(powers.score > 0);

const accusation = new FalsePowersState(createRandom(7788));
const safe = accusation.nodes.find(node => !node.corrupt);
accusation.scan(safe.index);
const stability = accusation.stability;
assert.equal(accusation.purify(safe.index).ok, false);
assert.equal(accusation.stability, stability - 1);

const words = new WordsState(createRandom(9911), 8);
for (let round = 0; round < 8; round += 1) {
	const sequence = words.beginRound();
	words.allowInput();
	for (const index of sequence) {
		words.accept(index);
	}
}
assert.equal(words.won, true);
assert.equal(words.round, 8);
assert.ok(words.score > 0);

const brokenWords = new WordsState(() => 0, 2);
const firstSequence = brokenWords.beginRound();
brokenWords.allowInput();
assert.equal(brokenWords.accept((firstSequence[0] + 1) % 4).mistake, true);
assert.equal(brokenWords.lives, 2);

const rescue = new EveryLifeState(createRandom(2233));
const start = rescue.position;
assert.equal(rescue.move('down').moved, false);
assert.equal(rescue.position, start);
assert.equal(rescue.move('right').moved, true);
assert.equal(rescue.moves, 33);
rescue.civilians = new Set();
rescue.position = rescue.shelter + rescue.size;
rescue.moves = 5;
rescue.health = 3;
rescue.move('up');
assert.equal(rescue.won, true);
assert.ok(rescue.score > 0);

const hazard = new EveryLifeState(createRandom(4455));
hazard.position = 8;
hazard.hazards = new Set([9]);
const health = hazard.health;
hazard.move('right');
assert.equal(hazard.health, health - 1);

const households = new HouseholdsState(createRandom(7711));
households.resources = { care: 99, counsel: 99, time: 99 };
while (!households.ended) {
	const event = households.current();
	const best = event.choices.reduce((winner, choice, index, choices) => {
		const value = Object.values(choice.effects).reduce((sum, effect) => sum + effect, 0);
		const winningValue = Object.values(choices[winner].effects).reduce((sum, effect) => sum + effect, 0);
		return value > winningValue ? index : winner;
	}, 0);
	households.choose(best);
}
assert.equal(households.won, true);
assert.equal(households.turn, 10);
assert.ok(households.score > 0);
console.log('B"H · False Powers, Words, Every Life, and Households verified.');
