// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleStatus.js
 * @description Applies readable short-lived states and one-turn guarding.
 *
 * A guard is not invisible armor; it is a chosen stance that rises and passes.
 * The Awtsmoos creates every defense and every opening anew, while this vessel
 * keeps the promise of the chosen turn clear for the traveler at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';

export const ensureBattleStatus = () => {
	State.Debate.status ||= { player: {}, enemy: {} };
	State.Debate.turn ||= 0;
	State.Debate.guard ||= { active: false, strength: 0 };
	return State.Debate.status;
};

export const guardPlayer = strength => {
	ensureBattleStatus();
	State.Debate.guard = {
		active: true,
		strength: Math.max(0.1, Math.min(0.85, Number(strength || 0.5)))
	};
	return State.Debate.guard;
};

export const applyStatusFromMove = (move, result) => {
	const status = ensureBattleStatus();
	const text = `${move.name} ${move.text}`.toLowerCase();
	if (text.includes('clarity') || move.role === 'study') status.enemy.dazed = 2;
	if (text.includes('warmth')) status.player.fervor = 2;
	if (text.includes('light')) status.enemy.shattered = 2;
	if (text.includes('joy') || move.heal) status.player.joy = 2;
	if (move.statusEffect === 'interrupt') status.enemy.interrupted = 1;
	if (result?.crit) status.enemy.awe = 1;
};

export const preEnemyReply = rawDamage => {
	const status = ensureBattleStatus();
	let value = Math.max(0, Number(rawDamage || 0));
	if (value === 0) return 0;
	if (status.enemy.dazed) value = Math.floor(value * 0.7);
	if (status.enemy.interrupted) value = Math.floor(value * 0.45);
	if (status.player.joy) value = Math.max(1, value - 2);
	if (State.Debate.guard.active) {
		value = Math.floor(value * (1 - State.Debate.guard.strength));
		State.Debate.guard = { active: false, strength: 0 };
	}
	return Math.max(0, value);
};

export const tickBattleStatus = () => {
	const status = ensureBattleStatus();
	State.Debate.turn += 1;
	for (const side of ['player', 'enemy']) {
		for (const key of Object.keys(status[side])) {
			status[side][key] -= 1;
			if (status[side][key] <= 0) delete status[side][key];
		}
	}
	return status;
};

export const statusLine = () => {
	const status = ensureBattleStatus();
	const player = Object.keys(status.player).join(', ') || 'clear';
	const enemy = Object.keys(status.enemy).join(', ') || 'clear';
	return `Player: ${player} | Opponent: ${enemy}`;
};
