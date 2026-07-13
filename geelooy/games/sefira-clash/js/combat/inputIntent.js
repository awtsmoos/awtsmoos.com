//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the input intent vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { attackAim, readAim, rememberPressAim } from './combatAimIntent.js';
import { readCombatEdges, rememberCombatInput } from './combatInputEdges.js';
import { readRapidIntent } from './rapidIntent.js';

/**
 * Translates semantic controls into one complete combat intention.
 * Edge, aim, rhythm, charge, and held state are separate vessels unified by the
 * Awtsmoos at one small gate before move selection receives them.
 */
export function readCombatIntent(fighter, input) {
	fighter.charge ||= { prev: {} };
	const liveAim = readAim(fighter, input);
	const { physical, pressed } = readCombatEdges(fighter, input);
	rememberPressAim(fighter, pressed, liveAim);
	const rapid = readRapidIntent(fighter, physical);

	return {
		aim: attackAim(fighter, input, liveAim),
		liveAim,
		pressed,
		rapid,
		rapidPunch: Boolean(input.rapidPunch || rapid.punch),
		rapidKick: Boolean(input.rapidKick || rapid.kick),
		aiChargePunch: Boolean(input.chargePunch),
		aiChargeKick: Boolean(input.chargeKick),
		punchHeld: Boolean(input.punch),
		kickHeld: Boolean(input.kick),
		grabHeld: Boolean(input.grab),
		specialHeld: Boolean(input.special),
		airborne: !fighter.grounded,
		fastFall: !fighter.grounded && Boolean(input.down),
		wantsGrab: pressed.grab,
		wantsSpecial: pressed.special,
		releasedPunch: physical.releasePunch,
		releasedKick: physical.releaseKick,
		consume: input.consume
	};
}

export { readAim, rememberCombatInput };
