// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleTurn.js
 * @description Resolves one visible command and the exact declared enemy intent.
 *
 * The player reads, chooses, and then watches the promised consequence unfold.
 * The Awtsmoos renews each turn without contradiction; this conductor keeps
 * intention and execution bound together as one honest road at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { recordQuoteUse } from '../codex/TorahCodexRuntime.js';
import { computeDefenseLoss } from '../equipment/EquipmentRuntime.js';
import { grantBattleSkills } from '../skills/SkillRuntime.js';
import { BATTLE_PHASE, isBattleBusy, setBattlePhase, tickBattlePhaseClock } from './BattlePhases.js';
import { applyPlayerAction, preparePlayerAction } from './BattlePlayerAction.js';
import { preEnemyReply, tickBattleStatus } from './BattleStatus.js';
import { showEnemyImpact, showEnemyWindup, showHealing, showPlayerImpact, showPlayerWindup } from './BattleTurnEffects.js';
import { chooseEnemyAction } from './EnemyAI.js';

export const chooseBattleMove = index => {
	if (State.ActiveRealm !== 'DEBATE' || isBattleBusy()) return false;
	const move = State.Debate.moves[index];
	if (!move) return false;
	State.Debate.cursor = index;
	State.Debate.lastMove = move;
	State.Debate.pendingPlayer = {
		move,
		result: preparePlayerAction(move, State.Debate.enemy),
		codex: recordQuoteUse(move)
	};
	showPlayerWindup(move);
	setBattlePhase(BATTLE_PHASE.PLAYER_WINDUP, `${move.role.toUpperCase()}: ${move.name}`);
	return true;
};

const playerImpact = () => {
	const pending = State.Debate.pendingPlayer;
	if (!pending) return setBattlePhase(BATTLE_PHASE.CHOICE);
	const { move, result, codex } = pending;
	const applied = applyPlayerAction(pending);
	grantBattleSkills(move, State.Debate.enemy, false);
	if (applied.healed > 0) showHealing(applied.healed);
	showPlayerImpact(move, result);
	const fusion = codex.unlocked?.length ? ` Fusion: ${codex.unlocked.join(', ')}.` : '';
	State.Debate.log.unshift(`${move.name}: ${result.damage} light.${result.desc || ''}${fusion}`);
	setBattlePhase(BATTLE_PHASE.PLAYER_IMPACT, `${move.role}: ${result.damage} light`);
};

const queueEnemy = () => {
	const action = State.Debate.intent || chooseEnemyAction(State.Debate.enemy, State.Debate.turn);
	State.Debate.pendingEnemy = action;
	showEnemyWindup(action);
	setBattlePhase(BATTLE_PHASE.ENEMY_WINDUP, `${action.icon} ${action.name}`);
};

const enemyImpact = () => {
	const action = State.Debate.pendingEnemy || chooseEnemyAction(State.Debate.enemy, State.Debate.turn);
	const preparedDamage = preEnemyReply(action.rawDamage);
	const defended = preparedDamage > 0
		? computeDefenseLoss(preparedDamage)
		: { loss: 0, shield: 0 };
	State.Stats.light = Math.max(0, State.Stats.light - defended.loss);
	State.Debate.pendingEnemy = { ...action, ...defended };
	showEnemyImpact(action, defended.loss);
	const line = defended.loss > 0
		? `${action.name} dealt ${defended.loss}. Shield absorbed ${defended.shield}.`
		: `${action.name} changed stance without dealing damage.`;
	State.Debate.log.unshift(line);
	setBattlePhase(BATTLE_PHASE.ENEMY_IMPACT, defended.loss > 0 ? `${defended.loss} light lost` : action.kind);
};

const finishEnemyTurn = () => {
	tickBattleStatus();
	State.Debate.pendingEnemy = null;
	State.Debate.pendingPlayer = null;
	State.Debate.cursor = 0;
	State.Debate.intent = chooseEnemyAction(State.Debate.enemy, State.Debate.turn);
	State.Debate.log.unshift(`Next: ${State.Debate.intent.name}. Counter with ${State.Debate.intent.counterTags.join(' or ')}.`);
	setBattlePhase(BATTLE_PHASE.CHOICE, 'Choose a command');
};

export const advanceBattleTurn = () => {
	if (!tickBattlePhaseClock()) return null;
	switch (State.Debate.phase) {
		case BATTLE_PHASE.INTRO:
			setBattlePhase(BATTLE_PHASE.CHOICE, 'Choose a command');
			break;
		case BATTLE_PHASE.PLAYER_WINDUP:
			playerImpact();
			break;
		case BATTLE_PHASE.PLAYER_IMPACT:
			if (State.Debate.enemyLight <= 0) return 'victory';
			queueEnemy();
			break;
		case BATTLE_PHASE.ENEMY_WINDUP:
			enemyImpact();
			break;
		case BATTLE_PHASE.ENEMY_IMPACT:
			if (State.Stats.light <= 0) return 'defeat';
			finishEnemyTurn();
			break;
		case BATTLE_PHASE.REWARD:
			return 'rewardComplete';
	}
	return null;
};
