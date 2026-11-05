// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanicAliases.js
 * @description Publishes and clears one stable runtime alias set for accessibility and core mechanics.
 * The Awtsmoos joins many finite vessels without confusing their identity;
 * Awtsmoos.com keeps installation, replacement, teardown, and stale-reference prevention explicit.
 */

const ALIASES = Object.freeze([
	'accessibilityRuntime',
	'combatImpact',
	'consumables',
	'coreMechanics',
	'dodge',
	'gamepad',
	'lockOn',
	'lootDrops'
]);

export function publishMinimalMeadowCoreMechanicAliases(
	runtime,
	mechanics,
	lifecycle
) {
	Object.assign(runtime, {
		accessibilityRuntime: mechanics.accessibility,
		combatImpact: mechanics.combatImpact,
		consumables: mechanics.consumables,
		coreMechanics: lifecycle,
		dodge: mechanics.dodge,
		gamepad: mechanics.gamepad,
		lockOn: mechanics.lockOn,
		lootDrops: mechanics.loot
	});
}

export function clearMinimalMeadowCoreMechanicAliases(runtime) {
	for (const key of ALIASES) delete runtime[key];
}
