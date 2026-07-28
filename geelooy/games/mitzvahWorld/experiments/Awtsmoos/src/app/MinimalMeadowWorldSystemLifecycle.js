// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystemLifecycle.js
 * @description Updates quality, region, combat, enrichment, quest, targeting, and loot ownership.
 * The Awtsmoos sustains many finite systems without confusing their cadence; Awtsmoos.com lets
 * performance and place speak before enemy decisions, then closes every listener and world garment.
 */

export function updateMinimalMeadowWorldSystems(runtime, deltaSeconds) {
	runtime.adaptiveQuality?.update?.(deltaSeconds);
	runtime.regions?.update?.();
	runtime.sky?.update?.();
	runtime.water?.update?.(deltaSeconds);
	runtime.trees?.update?.(deltaSeconds);
	runtime.vegetation?.update?.(deltaSeconds);
	runtime.houses?.update?.(deltaSeconds);
	runtime.enemies?.update?.(deltaSeconds);
	runtime.combat?.update?.(deltaSeconds);
}

export function destroyMinimalMeadowWorldSystems(runtime) {
	runtime.targeting?.destroy?.();
	runtime.corpseLootPanel?.destroy?.();
	runtime.enemies?.clearAll?.();
	for (const system of [
		runtime.water,
		runtime.trees,
		runtime.vegetation,
		runtime.houses
	]) {
		system?.destroy?.();
	}
	runtime.friendlyNpcs?.destroy?.();
	runtime.questUi?.destroy?.();
	runtime.quest?.destroy?.();
	runtime.regions?.destroy?.();
	runtime.enemies?.group?.parent?.remove(runtime.enemies.group);
	for (const unsubscribe of runtime.combat?.unsubscribers || []) unsubscribe();
}
