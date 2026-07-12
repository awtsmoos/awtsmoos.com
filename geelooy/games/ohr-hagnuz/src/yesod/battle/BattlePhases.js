/**
 * B"H
 * @module BattlePhases
 * @description The explicit heartbeat of every turn in Ohr HaGnuz.
 *
 * The Awtsmoos renews every instant from nothing. A battle therefore does not
 * hide inside one tangled function: choice, windup, impact, answer, and return
 * each receive a named vessel so animation and logic can agree.
 */
import { State } from '../../binah/State.js';

export const BATTLE_PHASE = Object.freeze({
	INTRO: 'intro',
	CHOICE: 'choice',
	PLAYER_WINDUP: 'playerWindup',
	PLAYER_IMPACT: 'playerImpact',
	ENEMY_WINDUP: 'enemyWindup',
	ENEMY_IMPACT: 'enemyImpact',
	REWARD: 'reward'
});

const DEFAULT_DURATION = Object.freeze({
	[BATTLE_PHASE.INTRO]: 24,
	[BATTLE_PHASE.PLAYER_WINDUP]: 14,
	[BATTLE_PHASE.PLAYER_IMPACT]: 24,
	[BATTLE_PHASE.ENEMY_WINDUP]: 18,
	[BATTLE_PHASE.ENEMY_IMPACT]: 22,
	[BATTLE_PHASE.REWARD]: 72,
	[BATTLE_PHASE.CHOICE]: 0
});

export const setBattlePhase = (phase, banner = '', duration = null) => {
	State.Debate.phase = phase;
	State.Debate.phaseTTL = duration ?? DEFAULT_DURATION[phase] ?? 0;
	State.Debate.banner = banner;
};

export const isBattleBusy = () => State.Debate.phase !== BATTLE_PHASE.CHOICE;

export const tickBattlePhaseClock = () => {
	if (!isBattleBusy()) return false;
	State.Debate.phaseTTL = Math.max(0, State.Debate.phaseTTL - 1);
	return State.Debate.phaseTTL === 0;
};
