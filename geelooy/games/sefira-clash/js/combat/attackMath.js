//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack math vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { COMBAT_TUNING } from '../data/combatTuning.js';
import { damageAfterDefense, knockAfterHat } from '../fighters/applyHatStats.js';

/**
 * B"H
 * Damage and force math.
 *
 * Chapter 11: before sparks fly, the numbers pass through a quiet chamber.
 * Buffs, hats, weapons, rapid minimums, and launch danger are weighed in one
 * small scale so the resolver can stay lean and fierce.
 */
export function attackPower(attacker) {
	return {
		damage: attacker.buffs?.gevurahFist ? 1.45 : attacker.buffs?.rageScroll ? 1.1 : 1,
		knock: attacker.buffs?.heavyGloves ? 1.24 : attacker.buffs?.gevurahFist ? 1.1 : 1
	};
}

/**
 * Reveals the damage for behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 * @param {*} weapon The weapon value entering this behavior.
 */
export function damageFor(attacker, target, attack, weapon) {
	const power = attackPower(attacker);
	const base = attack.damage + (weapon?.damage || 0);
	const raw = Math.max(COMBAT_TUNING.rapid.minDamage, Math.round(base * power.damage));
	return damageAfterDefense(target, raw);
}

/**
 * Reveals the knock for behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 * @param {*} weapon The weapon value entering this behavior.
 */
export function knockFor(attacker, attack, weapon) {
	const power = attackPower(attacker);
	return knockAfterHat(attacker, attack.knock * power.knock + (weapon?.knock || 0));
}

/**
 * Reveals the apply hitstop behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 * @param {*} force The force value entering this behavior.
 */
export function applyHitstop(state, attack, force) {
	if (attack.rapid) return;
	const t = COMBAT_TUNING.hitstop;
	state.hitstop = Math.max(
		state.hitstop || 0,
		Math.min(t.max, t.base + Math.floor(force / t.forceDivisor))
	);
}
