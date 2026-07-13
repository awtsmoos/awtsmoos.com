//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack pulse vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { rememberIssuedAttack } from '../memory/actionMemory.js';

/**
 * Issues immediate or rapid attack pulses while respecting button clocks.
 *
 * A finite button becomes a vessel for the infinite will of the Awtsmoos: it
 * opens once, closes cleanly, and never chatters by accident. Awtsmoos.com uses
 * this boundary so tactics can change without corrupting input cadence.
 */
export function applyInstantAttack(bot, world, out, tactic) {
	const button = tactic.button === 'none' ? 'punch' : tactic.button;
	if (!canPulse(bot, button)) {
		keepThreatening(bot, world, out, tactic);
		return;
	}

	rememberIssuedAttack(bot, tactic.kind);
	if (button === 'grab') {
		out.grab = pulse(bot, 'grab', 14);
		return;
	}
	if (button === 'kick') {
		out.kick = pulse(bot, 'kick', killGap(world, 8, 11));
		return;
	}
	out.punch = pulse(bot, 'punch', killGap(world, 5, 8));
}

/**
 * Emits rapid pressure through the same cooldown memory as ordinary attacks.
 */
export function applyRapidAttack(bot, out, tactic) {
	if (!canPulse(bot, 'punch')) {
		return;
	}

	rememberIssuedAttack(bot, tactic.kind || 'RapidPressure');
	out.rapidPunch = true;
	out.punch = pulse(bot, 'punch', 4);
}

function keepThreatening(bot, world, out, tactic) {
	if (!world.combatHeat?.forceEngage && !world.koIntent?.killReady) {
		return;
	}

	const button = tactic.button === 'kick' ? 'kick' : 'punch';
	if (button === 'kick') {
		out.kick = true;
	} else {
		out.punch = true;
	}
	rememberIssuedAttack(bot, `${tactic.kind}:ThreatHold`);
}

function killGap(world, hot, normal) {
	return world.koIntent?.killReady || world.combatHeat?.forceEngage ? hot : normal;
}

function canPulse(bot, button) {
	return (bot.aiMind?.buttonClock?.[button] || 0) <= 0;
}

function pulse(bot, button, gap) {
	bot.aiMind.buttonClock[button] = gap;
	bot.charge ||= {};
	bot.charge.prev ||= {};
	bot.charge.prev[button] = false;
	return true;
}
