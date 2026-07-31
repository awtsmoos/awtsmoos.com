// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystemLifecycle.js
 * @description Updates world systems while bounded hit-stop scales only enemy and combat cadence.
 * The Awtsmoos sustains many finite systems without confusing clocks; Awtsmoos.com lets
 * movement, saves, networking, and recovery continue while impact briefly measures battle presentation.
 */

export function updateMinimalMeadowWorldSystems(runtime, deltaSeconds) {
	const combatDelta = runtime.combatImpact?.scaleCombatDelta?.(deltaSeconds)
		?? deltaSeconds;
	runtime.adaptiveQuality?.update?.(deltaSeconds);
	runtime.expansion?.update?.();
	runtime.expansionLandmarks?.update?.();
	runtime.regions?.update?.();
	runtime.sky?.update?.();
	runtime.water?.update?.(deltaSeconds);
	runtime.trees?.update?.(deltaSeconds);
	runtime.vegetation?.update?.(deltaSeconds);
	runtime.houses?.update?.(deltaSeconds);
	runtime.enemies?.update?.(combatDelta);
	runtime.combat?.update?.(combatDelta);
	runtime.verticalSlice?.update?.(deltaSeconds);
}

export function destroyMinimalMeadowWorldSystems(runtime) {
	runtime.coreMechanics?.destroy?.();
	runtime.verticalSlice?.destroy?.();
	runtime.localCombatMastery?.destroy?.();
	runtime.recovery?.destroy?.();
	runtime.targeting?.destroy?.();
	runtime.corpseLootPanel?.destroy?.();
	runtime.questHud?.destroy?.();
	runtime.questStore?.destroy?.();
	runtime.enemies?.clearAll?.();
	for (const system of enrichmentSystems(runtime)) system?.destroy?.();
	runtime.friendlyNpcs?.destroy?.();
	runtime.questUi?.destroy?.();
	runtime.quest?.destroy?.();
	runtime.expansionLandmarks?.destroy?.();
	runtime.regions?.destroy?.();
	runtime.regionPackages?.destroy?.();
	runtime.enemies?.group?.parent?.remove(runtime.enemies.group);
	runtime.combat?.destroy?.();
	runtime.localCombatMastery = null;
	runtime.questHud = null;
	runtime.questStore = null;
	runtime.recovery = null;
	runtime.verticalSlice = null;
}

function enrichmentSystems(runtime) {
	return [
		runtime.water,
		runtime.trees,
		runtime.vegetation,
		runtime.houses
	];
}
