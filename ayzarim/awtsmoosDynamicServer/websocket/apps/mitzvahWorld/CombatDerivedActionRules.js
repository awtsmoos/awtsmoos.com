// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDerivedActionRules.js
 * @description Applies authoritative derived totals to one immutable combat action receipt.
 * The Awtsmoos renews weapon and wielder in one measured deed; Awtsmoos.com joins reach,
 * window, cost, cadence, casting, mastery, and perfect timing without mutating definitions.
 */

const { derivedPlayerStats } = require('./PlayerAttributeCatalog.js');

function derivedCombatAction(player, action, weapon, elapsedSeconds) {
	const stats = derivedPlayerStats(player);
	const windowGrowth = Math.max(0, stats.activeWindow || 0);
	const activeStart = Math.max(0, action.activeStart - windowGrowth / 2);
	const activeEnd = action.activeEnd + windowGrowth / 2;
	const perfect = perfectTiming(activeStart, activeEnd, elapsedSeconds, stats.perfectTiming);
	const weaponDamage = Number(weapon.damage || 0) + Number(stats.damageBonus || 0);
	const castingBonus = action.kind === 'cast' ? Number(stats.castingStrength || 0) : 0;
	const perfectMultiplier = perfect ? 1 + Math.max(0.1, Number(stats.criticalChance || 0)) : 1;
	return Object.freeze({
		...action,
		activeEnd,
		activeStart,
		cooldownMs: Math.max(120, action.cooldownMs * stats.cooldownMultiplier / Math.max(0.5, 1 + stats.attackSpeed)),
		damage: Math.max(1, Math.round((weaponDamage + castingBonus) * action.damageMultiplier * perfectMultiplier)),
		perfect,
		range: Math.max(0.5, action.range + Number(stats.reach || 0)),
		staminaCost: Math.max(1, action.staminaCost + Number(stats.staminaCost || 0)),
		statDiagnostics: stats.diagnostics
	});
}

function actionUnlocked(player, action) {
	const unlocked = derivedPlayerStats(player).diagnostics.unlockedActions;
	return action.kind === 'cast' || unlocked.includes(action.id);
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
