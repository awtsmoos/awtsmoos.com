/**
 * B"H
 * @file battleSmoke.mjs
 * @description Strict direct-turn battle test. It fails when a selected move does no damage.
 */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 } };

const { State } = await import('../binah/State.js');
const { battleReadyForInput, debateTick, startDebate, useMove } = await import('../yesod/OhrDebate.js');
const { encounterById } = await import('../data/EncounterIndex.js');

const held = { a: 0, b: 0, u: 0, d: 0, l: 0, r: 0 };
const tickUntil = (predicate, maximum = 240) => {
	for (let index = 0; index < maximum; index += 1) {
		debateTick(held);
		if (predicate()) return index + 1;
	}
	throw new Error('Battle did not reach the expected state.');
};

startDebate(encounterById('timekeeper'));
tickUntil(() => battleReadyForInput());

assert.equal(State.Debate.moves.length, 4, 'Battle must expose four direct moves.');
const enemyBefore = State.Debate.enemyLight;
const playerBefore = State.Stats.light;
assert.equal(useMove(0), true, 'The first press must select a real move.');

tickUntil(() => State.Debate.enemyLight < enemyBefore);
assert.ok(State.Debate.enemyLight < enemyBefore, 'A selected move must lower enemy light.');
tickUntil(() => battleReadyForInput() && State.Debate.turn === 1);
assert.ok(State.Stats.light < playerBefore, 'The enemy must complete a reply turn.');
assert.equal(State.Debate.phase, 'choice');

console.log(JSON.stringify({
	realm: State.ActiveRealm,
	enemy: State.Debate.enemy?.name,
	enemyBefore,
	enemyAfter: State.Debate.enemyLight,
	playerBefore,
	playerAfter: State.Stats.light,
	turn: State.Debate.turn,
	moves: State.Debate.moves.map(move => move.name)
}));
