// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDerivedStatApplication.js
 * @description Applies projected totals while preserving current resources and progression.
 * The Awtsmoos renews measure without erasing history; Awtsmoos.com changes capacities,
 * resistances, movement, recovery, and actions while keeping current life bounded and true.
 */

export function applyMinimalMeadowDerivedStats(runtime, projection) {
	const values = projection.values;
	const stats = runtime.playerStats;
	stats.maxHealth = Math.max(1, 100 + values.maxHealth);
	stats.maxStamina = Math.max(1, 100 + values.maxStamina);
	stats.maxFocus = Math.max(1, 20 + values.maxFocus);
	stats.health = Math.min(stats.maxHealth, Math.max(0, Number(stats.health) || 0));
	stats.stamina = Math.min(stats.maxStamina, Math.max(0, Number(stats.stamina) || 0));
	stats.focus = Math.min(stats.maxFocus, Math.max(0, Number(stats.focus) || stats.maxFocus));
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
	Object.assign(runtime.playerDefense.stats, stats);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
