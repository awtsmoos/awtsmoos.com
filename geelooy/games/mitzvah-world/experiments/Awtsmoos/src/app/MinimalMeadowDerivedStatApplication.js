// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDerivedStatApplication.js
 * @description Applies projected player totals in both lean visual worlds and full combat worlds, mirroring into defense only when that richer owner actually exists.
 * The Awtsmoos lets one traveler receive health, stamina, focus, motion, and resistance without inventing a battle vessel around him;
 * Awtsmoos.com preserves Simple Meadow's lightness while richer worlds may still reflect the same living stats through their already-created defense system.
 */

export function applyMinimalMeadowDerivedStats(runtime, projection) {
	const values = projection.values;
	const stats = runtime.playerStats;
	if (!stats || !runtime.state) return false;
	stats.maxHealth = Math.max(1, 100 + values.maxHealth);
	stats.maxStamina = Math.max(1, 100 + values.maxStamina);
	stats.maxFocus = Math.max(1, 20 + values.maxFocus);
	stats.health = bounded(stats.health, 0, stats.maxHealth);
	stats.stamina = bounded(stats.stamina, 0, stats.maxStamina);
	stats.focus = bounded(
		Number.isFinite(Number(stats.focus)) ? stats.focus : stats.maxFocus,
		0,
		stats.maxFocus
	);
	stats.guardStamina = Math.max(1, 100 + values.guardStamina);
	stats.blockStrength = clamp(0.45 + values.blockStrength, 0, 0.9);
	stats.physicalResistance = clamp(values.physicalResistance, 0, 0.85);
	stats.spiritualResistance = clamp(values.spiritualResistance, 0, 0.85);
	stats.rangedResistance = clamp(values.rangedResistance, 0, 0.85);
	stats.areaResistance = clamp(values.areaResistance, 0, 0.85);
	stats.staggerResistance = clamp(values.staggerResistance, 0, 0.85);
	stats.staminaRegeneration = Math.max(0, 14 + values.staminaRegeneration);
	stats.focusRegeneration = Math.max(0, 2 + values.focusRegeneration);
	stats.recoverySpeed = Math.max(0.2, 1 + values.recoverySpeed);
	runtime.state.movementSpeedMultiplier = Math.max(0.4, 1 + values.movementSpeed);
	runtime.state.environmentalResistance = clamp(values.environmentalResistance, 0, 0.9);
	runtime.unlockedCombatActions = new Set(projection.unlockedActions);
	if (runtime.playerDefense?.stats) {
		Object.assign(runtime.playerDefense.stats, stats);
	}
	return true;
}

function bounded(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
