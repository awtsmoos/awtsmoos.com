//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the apply hat stats vessel in this instant, revealing
 * its focused js fighters service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { HATS } from '../data/hats.js';

/**
 * B"H
 * Applies hat class stats and temporary blessing modifiers.
 *
 * Chapter 187: the hat gives the base nature; powerups bend it briefly. Shield
 * crystal softens damage, heavy gloves increase launch, and rage scroll presses
 * hitstun without rewriting the fighter's identity.
 */
export function applyHatStats(fighter) {
	const id = fighter.cosmetic?.headwear || 'kippah';
	const hat = HATS[id] || HATS.kippah;
	fighter.hatStats = { ...hat.stats, id: hat.id, label: hat.label };
	return fighter;
}

/**
 * Reveals the damage after defense behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} target The target value entering this behavior.
 * @param {*} amount The amount value entering this behavior.
 */
export function damageAfterDefense(target, amount) {
	const defense = (target.hatStats?.defense || 1) * (target.buffs?.shieldCrystal ? 1.22 : 1);
	return Math.max(1, Math.round(amount / defense));
}

/**
 * Reveals the knock after hat behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} amount The amount value entering this behavior.
 */
export function knockAfterHat(attacker, amount) {
	const gloves = attacker.buffs?.heavyGloves ? 1.22 : 1;
	const gevurah = attacker.buffs?.gevurahFist ? 1.08 : 1;
	return amount * (attacker.hatStats?.knock || 1) * gloves * gevurah;
}

/**
 * Reveals the charge speed behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 */
export function chargeSpeed(fighter) {
	const hod = fighter.buffs?.hodCharge ? 1.18 : 1;
	const rage = fighter.buffs?.rageScroll ? 1.08 : 1;
	return (fighter.hatStats?.charge || 1) * hod * rage;
}

/**
 * Reveals the stun multiplier behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 */
export function stunMultiplier(attacker) {
	return attacker.buffs?.rageScroll ? 1.18 : 1;
}

/**
 * Reveals the move buff behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 */
export function moveBuff(fighter) {
	const netzach = fighter.buffs?.netzachBoots ? 1.24 : 1;
	const speed = fighter.buffs?.speedBoots ? 1.25 : 1;
	return netzach * speed;
}
