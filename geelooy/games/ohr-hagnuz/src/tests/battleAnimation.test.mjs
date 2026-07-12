/**
 * B"H
 * @file battleAnimation.test.mjs
 * @description Every selected move must create visible windup and impact events.
 */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U:0, D:0, L:0, R:0, A:0, B:0 } };

const { State } = await import('../binah/State.js');
const { encounterById } = await import('../data/EncounterIndex.js');
const { battleReadyForInput, debateTick, startDebate, useMove } = await import('../yesod/OhrDebate.js');

const held = { a:0, b:0, u:0, d:0, l:0, r:0 };
const tickUntil = (predicate, maximum = 240) => {
	for (let index = 0; index < maximum; index += 1) {
		debateTick(held);
		if (predicate()) return;
	}
	throw new Error('Animation test did not reach the expected battle phase.');
};

startDebate(encounterById('tutorial_doubt'));
tickUntil(() => battleReadyForInput());
State.BattleFx = [];
const before = State.Debate.enemyLight;
assert.equal(useMove(0), true);
assert.ok(State.BattleFx.some(effect => effect.type === 'aura' && effect.target === 'player'));
assert.ok(State.BattleFx.some(effect => effect.type === 'projectile' && effect.target === 'enemy'));
assert.ok(State.BattleFx.every(effect => effect.ttl > 0 && effect.maxTtl >= effect.ttl));

tickUntil(() => State.Debate.enemyLight < before);
assert.ok(State.BattleFx.some(effect => effect.type === 'burst' && effect.target === 'enemy'));
assert.ok(State.BattleFx.some(effect => effect.type === 'damage' && effect.target === 'enemy'));
assert.ok(State.Debate.fxShake > 0);

console.log(JSON.stringify({
	effects: State.BattleFx.map(effect => `${effect.type}:${effect.target}`),
	damage: before - State.Debate.enemyLight,
	shake: State.Debate.fxShake
}));
