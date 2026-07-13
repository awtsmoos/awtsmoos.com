// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattlePlayerAction.js
 * @description Prepares and applies Attack, Study, Guard, and authored Companion roles.
 *
 * One hand may strike, listen, shelter, or call a friend. The Awtsmoos renews
 * every possibility without confusing its purpose; this vessel lets a companion
 * carry a truthful road-specific limit and protection into Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { computeDebateDamage, computeHeal } from '../equipment/EquipmentRuntime.js';
import { applyStatusFromMove, guardPlayer } from './BattleStatus.js';
import { recordMoveTrust } from './BattleTrust.js';

export const preparePlayerAction = (move, enemy) => {
	const computed = computeDebateDamage(move, enemy);
	if (move.role === 'guard') return { ...computed, damage: 0, desc: ' Guard raised.' };
	if (move.role === 'study') return { ...computed, damage: Math.min(4, computed.damage), desc: ' Temperament revealed.' };
	if (move.role === 'companion') {
		const damageCap = Math.max(0, Number(move.damageCap ?? 10));
		return { ...computed, damage: Math.min(damageCap, computed.damage), desc: ' Companion resonance.' };
	}
	return computed;
};

const healPlayer = move => {
	if (!move.heal) return 0;
	const before = State.Stats.light;
	State.Stats.light = Math.min(State.Stats.maxLight, before + computeHeal(move.heal));
	return State.Stats.light - before;
};

export const applyPlayerAction = pending => {
	const { move, result } = pending;
	const intent = State.Debate.intent;
	State.Debate.enemyLight = Math.max(0, State.Debate.enemyLight - result.damage);
	if (move.role === 'guard' || move.guardStrength) {
		guardPlayer(move.guardStrength || 0.5);
	}
	applyStatusFromMove(move, result);
	const healed = healPlayer(move);
	const evidence = recordMoveTrust(
		move,
		intent,
		State.Debate.enemyLight,
		State.Debate.enemyMaxLight
	);
	return { healed, evidence };
};
