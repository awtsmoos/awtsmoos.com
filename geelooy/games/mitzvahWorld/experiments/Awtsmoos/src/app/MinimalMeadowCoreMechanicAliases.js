// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanicAliases.js
 * @description Publishes and clears one stable runtime alias set for the six core mechanics.
 * The Awtsmoos joins many finite vessels without confusing their identity;
 * Awtsmoos.com keeps installation, replacement, teardown, and stale-reference prevention explicit.
 */

export function publishMinimalMeadowCoreMechanicAliases(
	runtime,
	mechanics,
	lifecycle
) {
	Object.assign(runtime, {
		combatImpact: mechanics.combatImpact,
		consumables: mechanics.consumables,
		coreMechanics: lifecycle,
		dodge: mechanics.dodge,
		lockOn: mechanics.lockOn,
		lootDrops: mechanics.loot
	});
}

export function clearMinimalMeadowCoreMechanicAliases(runtime) {
	for (const key of [
		'combatImpact',
		'consumables',
		'coreMechanics',
		'dodge',
		'lockOn',
		'lootDrops'
	]) {
		delete runtime[key];
	}
}
