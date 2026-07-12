/**
 * B"H
 * @module BattleSetup
 * @description Creates one direct four-move battle from an encounter.
 *
 * The infinite light enters four visible commands. The Torah tree remains in
 * every move, but the player's hand no longer crosses four menus before acting.
 */
import { State } from '../../binah/State.js';
import { resolveStats, syncLightCapacity } from '../equipment/EquipmentRuntime.js';
import { currentMoves } from '../abilities/AbilityRuntime.js';
import { ensureSkills } from '../skills/SkillRuntime.js';
import { ensureBag } from '../bag/BagRuntime.js';
import { isMusag, recordMusag } from '../musag/MusagDex.js';
import { pushBattleEffect } from '../../tiferet/render/BattleEffects.js';
import { resolveBattleRank, scaleEnemyLight } from './BattleRank.js';
import { ensureBattleStatus } from './BattleStatus.js';
import { BATTLE_PHASE, setBattlePhase } from './BattlePhases.js';

const battleMoves = () => currentMoves().slice(0, 4);

export const beginBattle = encounter => {
	if (!encounter) throw new Error('Cannot begin battle without an encounter.');
	ensureBag();
	syncLightCapacity();
	ensureSkills();
	const stats = resolveStats();
	const enemyLight = scaleEnemyLight(encounter);
	const moves = battleMoves();
	if (!moves.length) throw new Error('No unlocked battle moves are available.');

	State.ActiveRealm = 'DEBATE';
	State.HeroPath = [];
	Object.assign(State.Debate, {
		enemy: encounter,
		enemyLight,
		enemyMaxLight: enemyLight,
		cursor: 0,
		choice: null,
		lastMove: moves[0],
		rank: resolveBattleRank(encounter),
		status: { player: {}, enemy: {} },
		turn: 0,
		fxShake: 8,
		pendingPlayer: null,
		pendingEnemy: null,
		pendingReward: null,
		rewardText: '',
		outcome: null,
		moves
	});
	ensureBattleStatus();
	State.BattleFx = [];
	pushBattleEffect('shield', 'player', stats.soulClass?.name || stats.garment?.name || 'garment');
	pushBattleEffect('enemy', 'enemy', encounter.name || 'musag');
	if (isMusag(encounter)) recordMusag(encounter, false);
	setBattlePhase(BATTLE_PHASE.INTRO, `${encounter.name} appears`);
	State.Debate.log = [
		`${State.Debate.rank.label}: ${encounter.lesson}`,
		`Weakness: ${encounter.weakTo || 'Any Torah'} • Element: ${encounter.element || 'Guide'}`,
		'Choose one of four moves. One press performs one action.'
	];
	State.say(`Debate: ${encounter.name}. Prepare one of four Torah moves.`, 360);
	return State.Debate;
};
