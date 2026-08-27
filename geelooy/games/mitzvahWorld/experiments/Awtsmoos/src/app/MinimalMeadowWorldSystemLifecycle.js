// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystemLifecycle.js
 * @description Advances every immediate world system through one existing frame covenant and tears each vessel down exactly once.
 * The Awtsmoos sustains combat, air, water, forest, and story through one measured rhythm without multiplying clocks;
 * Awtsmoos.com lets subtle motes breathe beside heavier systems, then returns every owned vessel to silence when the world unlocks.
 */

/**
 * Advances immediate and hydrated world systems while hit-stop scales only combat cadence.
 * @param {object} runtime Mitzvah World runtime.
 * @param {number} deltaSeconds Frame duration.
 */
export function updateMinimalMeadowWorldSystems(runtime, deltaSeconds) {
	const combatDelta = runtime.combatImpact?.scaleCombatDelta?.(deltaSeconds)
		?? deltaSeconds;
	runtime.adaptiveQuality?.update?.(deltaSeconds);
	runtime.ambientMotes?.update?.(deltaSeconds);
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

/**
 * Destroys every owned world-system vessel and clears retained public handles.
 * @param {object} runtime Mitzvah World runtime.
 */
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
	for (const system of enrichmentSystems(runtime)) {
		system?.destroy?.();
	}
	runtime.friendlyNpcs?.destroy?.();
	runtime.questUi?.destroy?.();
	runtime.quest?.destroy?.();
	runtime.expansionLandmarks?.destroy?.();
	runtime.regions?.destroy?.();
	runtime.regionPackages?.destroy?.();
	runtime.enemies?.group?.parent?.remove(runtime.enemies.group);
	runtime.combat?.destroy?.();
	clearWorldHandles(runtime);
}

/** Returns systems hydrated after first playability, including subtle atmosphere. */
function enrichmentSystems(runtime) {
	return [
		runtime.ambientMotes,
		runtime.water,
		runtime.trees,
		runtime.vegetation,
		runtime.houses
	];
}

/** Clears lifecycle-owned handles so diagnostics cannot report destroyed systems as alive. */
function clearWorldHandles(runtime) {
	runtime.ambientMotes = null;
	runtime.localCombatMastery = null;
	runtime.questHud = null;
	runtime.questStore = null;
	runtime.recovery = null;
	runtime.verticalSlice = null;
}
