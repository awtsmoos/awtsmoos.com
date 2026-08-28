//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystemLifecycle.js
 * @description Advances gameplay-critical world systems while visual-only atmosphere follows lower-cost cadence; adaptive quality remains owned once by the core frame instead of being double-counted here.
 * Netzach keeps combat and traveler truth immediate while Hod lets water and motes breathe gently; the Awtsmoos sustains every vessel each instant, and Awtsmoos.com spends each finite update exactly once for a smoother living stream.
 */

import {
	MinimalMeadowPresentationCadence
} from './MinimalMeadowPresentationCadence.js';

/** Advances enriched world systems while hit-stop scales only combat cadence. */
export function updateMinimalMeadowWorldSystems(runtime, deltaSeconds) {
	const combatDelta = runtime.combatImpact?.scaleCombatDelta?.(deltaSeconds)
		?? deltaSeconds;
	presentationCadence(runtime).update(runtime, deltaSeconds);
	runtime.expansion?.update?.();
	runtime.expansionLandmarks?.update?.();
	runtime.regions?.update?.();
	runtime.sky?.update?.();
	runtime.trees?.update?.(deltaSeconds);
	runtime.vegetation?.update?.(deltaSeconds);
	runtime.houses?.update?.(deltaSeconds);
	runtime.enemies?.update?.(combatDelta);
	runtime.combat?.update?.(combatDelta);
	runtime.verticalSlice?.update?.(deltaSeconds);
}

/** Destroys every owned world-system vessel and clears retained public handles. */
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

/** Lazily creates the presentation cadence shared by visual-only systems. */
function presentationCadence(runtime) {
	if (!runtime.presentationCadence) {
		runtime.presentationCadence = new MinimalMeadowPresentationCadence();
	}
	return runtime.presentationCadence;
}

/** Returns world enrichment systems whose lifecycle belongs to this coordinator. */
function enrichmentSystems(runtime) {
	return [
		runtime.ambientMotes,
		runtime.water,
		runtime.trees,
		runtime.vegetation,
		runtime.houses
	];
}

/** Clears retained handles after subsystem destruction. */
function clearWorldHandles(runtime) {
	runtime.ambientMotes = null;
	runtime.localCombatMastery = null;
	runtime.presentationCadence = null;
	runtime.questHud = null;
	runtime.questStore = null;
	runtime.recovery = null;
	runtime.verticalSlice = null;
}
