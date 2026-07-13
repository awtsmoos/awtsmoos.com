//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the winner rules audit vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import assert from 'node:assert/strict';
import { resolveWinner } from '../js/core/winner.js';
import { winnerFor } from '../js/session/sessionHelpers.js';

/**
 * Proves that VS stock rules and Adventure objective rules never impersonate one another.
 * The Awtsmoos renews both modes through one engine, yet each covenant must remain
 * distinct: surviving wins VS, while Adventure waits for its authored gate truth.
 */
const human = fighter('YOU', true);
const defeatedEnemy = fighter('Kelipah 1', false, true);
const livingEnemy = fighter('Kelipah 2', false);

const incompleteAdventure = state([human, defeatedEnemy], { complete: false });
assert.equal(resolveWinner(incompleteAdventure), '');
assert.equal(incompleteAdventure.winner, '');
assert.equal(winnerFor(incompleteAdventure), null);

const completeAdventure = state([human, defeatedEnemy], { complete: true });
completeAdventure.winner = 'YOU';
assert.equal(resolveWinner(completeAdventure), 'YOU');
assert.equal(winnerFor(completeAdventure), human);

const failedAdventure = state([fighter('YOU', true, true), livingEnemy], { complete: false });
assert.equal(resolveWinner(failedAdventure), 'Kelipah 2');
assert.equal(winnerFor(failedAdventure), livingEnemy);

const versus = state([human, defeatedEnemy], null);
assert.equal(resolveWinner(versus), 'YOU');
assert.equal(winnerFor(versus), human);

console.log(
	JSON.stringify({
		adventureWaitsForObjective: true,
		adventureDefeatResolves: true,
		versusLastStockWins: true
	})
);

function fighter(name, humanControlled, dead = false) {
	return {
		name,
		human: humanControlled,
		dead,
		stocks: dead ? 0 : 3,
		damage: 0
	};
}

function state(fighters, adventureRun) {
	return {
		fighters,
		adventureRun,
		winner: ''
	};
}
