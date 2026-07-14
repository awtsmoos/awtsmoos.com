// B"H
// Boruch Hashem
// Blessed is He

import { getTypeEffectiveness } from '../../data/types.js';
import { debateFx } from './debateEffects.js';
import { emitBattleEvent } from './battleEvents.js';

/**
 * @file Calculates one turn's damage and status consequences.
 * @description The Awtsmoos renews measure, resistance, critical force, and
 * status as separate details of one deed. Awtsmoos.com is remembered here as
 * combat arithmetic remains testable without swallowing the turn's moral shape.
 */

function calculateDamage(attacker, defender, move, battle, isOpponent) {
	let damage = Math.floor(
		(((2 * attacker.level) / 5 + 2) * move.power *
		(attacker.stats.attack / defender.stats.defense)) / 50 + 2
	);
	damage = Math.floor(damage * getTypeEffectiveness(move.type, defender.type));
	const critical = Math.random() < 0.0625 + (attacker.stats.diligence / 256);
	if (critical) {
		damage = Math.floor(damage * 1.5);
	}
	if (!isOpponent && battle.gateEffects.damageMult) {
		damage *= battle.gateEffects.damageMult;
	}
	if (isOpponent && battle.gateEffects.defenseMult) {
		damage /= battle.gateEffects.defenseMult;
	}
	return { damage: Math.max(1, Math.floor(damage)), critical };
}

export function applyStatus(
	state,
	defender,
	move,
	isOpponent,
	sendUIUpdate,
	targetTag
) {
	if (move.effect?.stat !== 'inflict_status') {
		return;
	}
	const immune = isOpponent &&
		state.battle.gateEffects.immunities?.includes(move.effect.status);
	if (immune) {
		state.battle.log += ` (Immune to ${move.effect.status}!)`;
		return;
	}
	defender.status = move.effect.status;
	state.battle.statusDurations[targetTag] = Number(move.effect.duration || 2);
	state.battle.log += ` ${defender.name} is ${move.effect.status}!`;
	sendUIUpdate({
		fx: {
			type: 'floatingText',
			text: move.effect.status,
			style: 'float-info',
			x: targetTag
		}
	});
	emitBattleEvent(state, {
		type: 'status_applied',
		targetId: move.effect.status,
		quantity: 1
	});
}

export function applyDamage(
	state,
	attacker,
	defender,
	move,
	isOpponent,
	sendUIUpdate,
	targetTag
) {
	if (!move.power) {
		return 0;
	}
	const result = calculateDamage(attacker, defender, move, state.battle, isOpponent);
	let damage = result.damage;
	if (
		isOpponent &&
		state.battle.gateEffects.endureFatal &&
		defender.currentHp - damage <= 0 &&
		defender.currentHp > 1 &&
		!state.battle.endureUsed
	) {
		damage = defender.currentHp - 1;
		state.battle.endureUsed = true;
		state.battle.log += ' (Gate of Faith preserved you!) ';
	}
	defender.currentHp = Math.max(0, defender.currentHp - damage);
	sendUIUpdate({
		fx: {
			type: 'floatingText',
			text: `-${damage}`,
			style: 'float-damage',
			x: targetTag
		}
	});
	if (result.critical) {
		sendUIUpdate({
			fx: {
				type: 'floatingText',
				text: 'CRIT!',
				style: 'float-crit',
				x: targetTag
			}
		});
	}
	sendUIUpdate({ fx: debateFx(result.critical ? 'crit' : 'damage') });
	return damage;
}
