// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDerivedActionRules.js
 * @description Applies authoritative equipment, attribute, affinity, and timing totals to one action.
 * The Awtsmoos renews weapon and wielder in one measured deed; Awtsmoos.com joins reach,
 * cadence, casting, Gevurah interruption, Malchus guard pressure, and perfect timing without mutation.
 */

const { derivedPlayerStats } = require('./PlayerAttributeCatalog.js');

function derivedCombatAction(player, action, weapon, elapsedSeconds) {
	const stats = derivedPlayerStats(player);
	const windowGrowth = Math.max(0, Number(stats.activeWindow || 0));
	const activeStart = Math.max(0, action.activeStart - windowGrowth / 2);
	const activeEnd = action.activeEnd + windowGrowth / 2;
	const perfect = perfectTiming(activeStart, activeEnd, elapsedSeconds, stats.perfectTiming);
	const weaponDamage = Number(weapon.damage || 0) + Number(stats.damageBonus || 0);
	const castingBonus = action.kind === 'cast' ? Number(stats.castingStrength || 0) : 0;
	const perfectMultiplier = perfect
		? 1 + Math.max(0.1, Number(stats.criticalChance || 0))
		: 1;
	return Object.freeze({
		...action,
		activeEnd,
		activeStart,
		cooldownMs: derivedCooldown(action, stats),
		damage: Math.max(1, Math.round(
			(weaponDamage + castingBonus) * action.damageMultiplier * perfectMultiplier
		)),
		guardDamage: derivedGuardDamage(action, stats),
		interruptForce: Math.max(
			0,
			Number(action.interruptForce || 0) + Number(stats.interruptForceBonus || 0)
		),
		perfect,
		poise: Number(stats.affinityMechanics?.malchus?.poise || 0),
		range: Math.max(0.5, action.range + Number(stats.reach || 0)),
		staminaCost: Math.max(1, action.staminaCost + Number(stats.staminaCost || 0)),
		statDiagnostics: stats.diagnostics
	});
}

function actionUnlocked(player, action) {
	const stats = derivedPlayerStats(player);
	const unlocked = stats.diagnostics.unlockedActions;
	if (action.kind !== 'cast') return unlocked.includes(action.id);
	const loadout = player.shliach?.affinityLoadout;
	if (!loadout?.actionIds?.length) return true;
	return loadout.actionIds.includes(action.canonicalActionId || action.id);
}

function derivedGuardDamage(action, stats) {
	const base = Number(action.guardDamage || 0);
	if (action.affinityId !== 'malchus') return base;
	const bonus = Number(stats.affinityMechanics?.malchus?.guardDamageBonus || 0);
	return Math.max(0, Math.round(base * (1 + bonus)));
}

function derivedCooldown(action, stats) {
	return Math.max(
		120,
		action.cooldownMs
			* stats.cooldownMultiplier
			/ Math.max(0.5, 1 + Number(stats.attackSpeed || 0))
	);
}

function perfectTiming(start, end, elapsed, bonus) {
	const center = (start + end) / 2;
	const radius = Math.max(0.025, (end - start) * 0.16 + Number(bonus || 0));
	return Math.abs(Number(elapsed) - center) <= radius;
}

module.exports = {
	actionUnlocked,
	derivedCombatAction
};
