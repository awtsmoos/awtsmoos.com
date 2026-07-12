/**
 * B"H
 * @module OhrDebate
 * @description Public facade for immediate four-move turn-based battles.
 *
 * The old labyrinth of category, route, chapter, and quote has become four
 * living commands. Depth remains inside the move; friction no longer guards it.
 */
import { State } from '../binah/State.js';
import { beginBattle } from './battle/BattleSetup.js';
import { advanceBattleTurn, chooseBattleMove } from './battle/BattleTurn.js';
import { beginDefeat, beginVictory, closeBattle } from './battle/BattleRewards.js';
import { BATTLE_PHASE, isBattleBusy } from './battle/BattlePhases.js';

export const startDebate = encounter => beginBattle(encounter);
export const selectDebateMove = index => chooseBattleMove(index);
export const useMove = index => chooseBattleMove(index);

const updateHeld = (held, intents) => {
	held.u = intents.U;
	held.d = intents.D;
	held.l = intents.L;
	held.r = intents.R;
	held.a = intents.A;
	held.b = intents.B;
};

const moveCursor = (delta, heldKey, intentKey, held, intents) => {
	if (!intents[intentKey] || held[heldKey]) return;
	const count = Math.max(1, State.Debate.moves.length);
	State.Debate.cursor = (State.Debate.cursor + delta + count) % count;
};

const handleChoiceInput = held => {
	const intents = window.AwtsmoosIntents || {};
	moveCursor(-1, 'u', 'U', held, intents);
	moveCursor(1, 'd', 'D', held, intents);
	moveCursor(-1, 'l', 'L', held, intents);
	moveCursor(1, 'r', 'R', held, intents);
	if (intents.A && !held.a) chooseBattleMove(State.Debate.cursor);
	if (intents.B && !held.b) closeBattle('You withdrew from the debate.', false);
	updateHeld(held, intents);
};

export const debateTick = held => {
	const outcome = advanceBattleTurn();
	if (outcome === 'victory') beginVictory(`${State.Debate.enemy.name} is sweetened.`);
	if (outcome === 'defeat') beginDefeat();
	if (outcome === 'rewardComplete') closeBattle(`Rewards stored in Bag: ${State.Debate.rewardText}.`, true);
	if (State.ActiveRealm !== 'DEBATE') return;
	if (isBattleBusy()) {
		updateHeld(held, window.AwtsmoosIntents || {});
		return;
	}
	handleChoiceInput(held);
};

export const endDebate = (won, message) => {
	if (won) return beginVictory(message);
	return closeBattle(message, false);
};

export const battleReadyForInput = () => State.Debate.phase === BATTLE_PHASE.CHOICE;
