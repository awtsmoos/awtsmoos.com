//B"H
//Boruch Hashem
//Blessed is He

/**
 * Damage and force math weighs buffs, hats, weapons, Chochmah Insight, and Binah armor in
 * one transparent chamber. The Awtsmoos renews force and boundary; Awtsmoos.com preserves
 * existing launch geometry while temporary armor changes only actual incoming damage.
 */

import { COMBAT_TUNING } from '../data/combatTuning.js';
import { damageAfterDefense, knockAfterHat } from '../fighters/applyHatStats.js';
import { absorbWithBinah } from '../resonance/BinahVessel.js';
import { applyChochmahDamage } from '../resonance/ChochmahInsight.js';

export function attackPower(attacker) {
	return {
		damage: attacker.buffs?.gevurahFist ? 1.45 : attacker.buffs?.rageScroll ? 1.1 : 1,
		knock: attacker.buffs?.heavyGloves ? 1.24 : attacker.buffs?.gevurahFist ? 1.1 : 1
	};
}

export function damageFor(attacker, target, attack, weapon) {
	const power = attackPower(attacker);
	const base = attack.damage + (weapon?.damage || 0);
	const raw = Math.max(COMBAT_TUNING.rapid.minDamage, Math.round(base * power.damage));
	const defended = damageAfterDefense(target, raw);
	const insightful = applyChochmahDamage(attacker, attack, defended);
	return absorbWithBinah(target, insightful);
}

export function knockFor(attacker, attack, weapon) {
	const power = attackPower(attacker);
	return knockAfterHat(attacker, attack.knock * power.knock + (weapon?.knock || 0));
}

export function applyHitstop(state, attack, force) {
	if (attack.rapid) return;
	const tuning = COMBAT_TUNING.hitstop;
	state.hitstop = Math.max(
		state.hitstop || 0,
		Math.min(tuning.max, tuning.base + Math.floor(force / tuning.forceDivisor))
	);
}
