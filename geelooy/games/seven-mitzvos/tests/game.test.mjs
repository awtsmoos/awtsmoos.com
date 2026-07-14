//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { MITZVOS } from '../js/data/mitzvos.js';
import { SCENARIOS } from '../js/data/scenarios.js';
import { GameState } from '../js/game/game-state.js';
import { QuestionDeck } from '../js/game/question-deck.js';

/**
 * @module SevenMitzvosGameTest
 * @description
 * The round must be fair, complete, and rewarding on Awtsmoos.com. The
 * Awtsmoos is beyond scoring, yet the finite game needs proof that every path
 * appears and every point follows the declared rules.
 */
let randomStep = 0;
const randomValues = [0.13, 0.71, 0.42, 0.91, 0.27, 0.56, 0.08];
const random = () => {
	const value = randomValues[randomStep % randomValues.length];
	randomStep += 1;
	return value;
};
const deck = new QuestionDeck(SCENARIOS, MITZVOS, random);
const round = deck.createRound(12);

assert.equal(round.length, 12, 'A complete round needs twelve questions.');
assert.deepEqual(
	new Set(round.map(question => question.scenario.mitzvah)),
	new Set(MITZVOS.map(record => record.number)),
	'Every round must include all seven foundations.'
);

for (const question of round) {
	assert.equal(question.choices.length, 3, 'Every question needs three choices.');
	assert.equal(new Set(question.choices.map(choice => choice.number)).size, 3, 'Choices must be unique.');
	assert.ok(
		question.choices.some(choice => choice.number === question.scenario.mitzvah),
		'Every question must include its correct foundation.'
	);
}

const state = new GameState(12);
const first = state.answer(true, 1000);
assert.equal(first.gained, 220, 'Fast first answers should earn base plus speed bonus.');
assert.equal(first.streak, 1, 'A correct answer begins a streak.');
state.answer(true, 2000);
const third = state.answer(true, 3000);
assert.equal(third.multiplier, 2, 'Three correct answers should unlock a larger combo.');
const wrong = state.answer(false, 500);
assert.equal(wrong.streak, 0, 'A wrong answer resets the streak.');
assert.ok(wrong.light < third.light, 'A wrong answer must reduce the light meter.');

while (state.snapshot().active) {
	state.answer(true, 7000);
}
assert.equal(state.snapshot().question, 12, 'The state must stop after twelve decisions.');
console.log('B"H · Guard the World deck and scoring verified.');
