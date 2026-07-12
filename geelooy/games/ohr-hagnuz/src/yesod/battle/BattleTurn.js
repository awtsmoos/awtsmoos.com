/**
 * B"H
 * @module BattleTurn
 * @description Resolves one visible player action and one visible enemy reply.
 */
import { State } from '../../binah/State.js';
import { recordQuoteUse } from '../codex/TorahCodexRuntime.js';
import { computeDebateDamage, computeDefenseLoss, computeHeal } from '../equipment/EquipmentRuntime.js';
import { grantBattleSkills } from '../skills/SkillRuntime.js';
import { applyStatusFromMove, preEnemyReply, tickBattleStatus } from './BattleStatus.js';
import { chooseEnemyAction } from './EnemyAI.js';
import { BATTLE_PHASE, isBattleBusy, setBattlePhase, tickBattlePhaseClock } from './BattlePhases.js';
import { showEnemyImpact, showEnemyWindup, showHealing, showPlayerImpact, showPlayerWindup } from './BattleTurnEffects.js';

export const chooseBattleMove = index => {
	if (State.ActiveRealm !== 'DEBATE' || isBattleBusy()) return false;
	const move = State.Debate.moves[index];
	if (!move) return false;
	State.Debate.cursor = index;
	State.Debate.lastMove = move;
	State.Debate.pendingPlayer = {
		move,
		result: computeDebateDamage(move, State.Debate.enemy),
		codex: recordQuoteUse(move)
	};
	showPlayerWindup(move);
	setBattlePhase(BATTLE_PHASE.PLAYER_WINDUP, `${move.name}!`);
	return true;
};

const healPlayer = move => {
	if (!move.heal) return 0;
	const before = State.Stats.light;
	State.Stats.light = Math.min(State.Stats.maxLight, before + computeHeal(move.heal));
	const amount = State.Stats.light - before;
	showHealing(amount);
	return amount;
};

const playerImpact = () => {
	const pending = State.Debate.pendingPlayer;
	if (!pending) return setBattlePhase(BATTLE_PHASE.CHOICE);
	const { move, result, codex } = pending;
	State.Debate.enemyLight = Math.max(0, State.Debate.enemyLight - result.damage);
	grantBattleSkills(move, State.Debate.enemy, false);
	applyStatusFromMove(move, result);
	healPlayer(move);
	showPlayerImpact(move, result);
	const fusion = codex.unlocked?.length ? ` Fusion: ${codex.unlocked.join(', ')}.` : '';
	State.Debate.log.unshift(`${move.name} dealt ${result.damage}.${result.desc || ''}${fusion}`);
	setBattlePhase(BATTLE_PHASE.PLAYER_IMPACT, `${result.damage} light damage`);
};

const queueEnemy = () => {
	const action = chooseEnemyAction(State.Debate.enemy, State.Debate.turn);
	State.Debate.pendingEnemy = action;
	showEnemyWindup(action);
	setBattlePhase(BATTLE_PHASE.ENEMY_WINDUP, `${State.Debate.enemy.name}: ${action.name}`);
};

const enemyImpact = () => {
	const action = State.Debate.pendingEnemy || { name: 'Enemy Reply', rawDamage: 5 };
	const defended = computeDefenseLoss(preEnemyReply(action.rawDamage));
	State.Stats.light = Math.max(0, State.Stats.light - defended.loss);
	State.Debate.pendingEnemy = { ...action, ...defended };
	showEnemyImpact(action, defended.loss);
	State.Debate.log.unshift(`${action.name} dealt ${defended.loss}. Shield absorbed ${defended.shield}.`);
	setBattlePhase(BATTLE_PHASE.ENEMY_IMPACT, `${defended.loss} light lost`);
};

const finishEnemyTurn = () => {
	tickBattleStatus();
	State.Debate.pendingEnemy = null;
	State.Debate.pendingPlayer = null;
	State.Debate.cursor = 0;
	setBattlePhase(BATTLE_PHASE.CHOICE, 'Choose a move');
};

export const advanceBattleTurn = () => {
	if (!tickBattlePhaseClock()) return null;
	switch (State.Debate.phase) {
		case BATTLE_PHASE.INTRO: setBattlePhase(BATTLE_PHASE.CHOICE, 'Choose a move'); break;
		case BATTLE_PHASE.PLAYER_WINDUP: playerImpact(); break;
		case BATTLE_PHASE.PLAYER_IMPACT:
			if (State.Debate.enemyLight <= 0) return 'victory';
			queueEnemy();
			break;
		case BATTLE_PHASE.ENEMY_WINDUP: enemyImpact(); break;
		case BATTLE_PHASE.ENEMY_IMPACT:
			if (State.Stats.light <= 0) return 'defeat';
			finishEnemyTurn();
			break;
		case BATTLE_PHASE.REWARD: return 'rewardComplete';
	}
	return null;
};
