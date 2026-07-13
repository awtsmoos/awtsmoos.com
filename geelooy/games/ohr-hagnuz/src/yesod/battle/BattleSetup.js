// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleSetup.js
 * @description Creates one direct battle with visible intent and truthful world context.
 *
 * Before force moves, its direction is named. The Awtsmoos creates warning,
 * choice, memory, and consequence as one living order; a restored lamp may now
 * reach a later veil without replacing the battle road at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { pushBattleEffect } from '../../tiferet/render/BattleEffects.js';
import { currentMoves } from '../abilities/AbilityRuntime.js';
import { ensureBag } from '../bag/BagRuntime.js';
import { resolveStats, syncLightCapacity } from '../equipment/EquipmentRuntime.js';
import { isMusag, recordMusag } from '../musag/MusagDex.js';
import { ensureSkills } from '../skills/SkillRuntime.js';
import { applyBentReedsEnemyLight } from './BentReedsBattleContext.js';
import { normalizeBattleMoves } from './BattleCommandRules.js';
import { BATTLE_PHASE, setBattlePhase } from './BattlePhases.js';
import { resolveBattleRank, scaleEnemyLight } from './BattleRank.js';
import { ensureBattleStatus } from './BattleStatus.js';
import { ensureBattleTrust } from './BattleTrust.js';
import { chooseEnemyAction } from './EnemyAI.js';

const battleMoves = () => normalizeBattleMoves(currentMoves()).slice(0, 4);

export const beginBattle = encounter => {
	if (!encounter) throw new Error('Cannot begin battle without an encounter.');
	ensureBag();
	syncLightCapacity();
	ensureSkills();
	const stats = resolveStats();
	const worldEffect = applyBentReedsEnemyLight(encounter, scaleEnemyLight(encounter));
	const moves = battleMoves();
	if (!moves.length) throw new Error('No unlocked battle moves are available.');

	State.ActiveRealm = 'DEBATE';
	State.HeroPath = [];
	Object.assign(State.Debate, {
		enemy: encounter,
		enemyLight: worldEffect.enemyLight,
		enemyMaxLight: worldEffect.enemyLight,
		cursor: 0,
		choice: null,
		lastMove: moves[0],
		rank: resolveBattleRank(encounter),
		worldContext: worldEffect.context,
		status: { player: {}, enemy: {} },
		turn: 0,
		fxShake: 8,
		pendingPlayer: null,
		pendingEnemy: null,
		pendingReward: null,
		rewardText: '',
		outcome: null,
		moves,
		intent: chooseEnemyAction(encounter, 0),
		guard: { active: false, strength: 0 },
		trust: { evidence: null, result: null }
	});
	ensureBattleStatus();
	ensureBattleTrust();
	State.BattleFx = [];
	pushBattleEffect('shield', 'player', stats.soulClass?.name || stats.garment?.name || 'garment');
	pushBattleEffect('enemy', 'enemy', encounter.name || 'nitzotz');
	if (isMusag(encounter)) recordMusag(encounter, false);
	setBattlePhase(BATTLE_PHASE.INTRO, `${encounter.name} appears`);
	State.Debate.log = [
		worldEffect.context.openingLine,
		`${State.Debate.rank.label}: ${encounter.lesson || encounter.passive || 'A concealed spark waits.'}`,
		`Next intent: ${State.Debate.intent.name}. Counter: ${State.Debate.intent.counterTags.join(' or ')}.`,
		'Choose Attack, Study, Guard, or Companion through the four direct cards.'
	].filter(Boolean);
	const worldLine = worldEffect.context.openingLine ? ` ${worldEffect.context.openingLine}` : '';
	State.say(`Encounter: ${encounter.name}. Its next intention is visible.${worldLine}`, 520);
	return State.Debate;
};
