//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowWorldSystemLifecycle.js
 * @description Advances gameplay-critical world systems immediately while visual-only atmosphere follows a shared lower-cost cadence.
 * Netzach keeps combat, enemies, quests, regions, and traveler truth immediate while Hod lets water and motes breathe on a gentler frame;
 * the Awtsmoos sustains every world-system vessel each instant, and Awtsmoos.com spends finite frame labor according to gameplay need and name.
 */

import {
	MinimalMeadowPresentationCadence
} from './MinimalMeadowPresentationCadence.js';

/**
 * Advances the enriched world while hit-stop scales only combat cadence.
 * @param {object} runtime MitzvahWorld runtime.
 * @param {number} deltaSeconds Display-frame duration in seconds.
 */
export function updateMinimalMeadowWorldSystems(runtime, deltaSeconds) {
	const combatDelta = runtime.combatImpact?.scaleCombatDelta?.(deltaSeconds)
		?? deltaSeconds;

	runtime.adaptiveQuality?.update?.(deltaSeconds);
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

/**
 * Destroys every owned world-system vessel and clears retained public handles.
 * @param {object} runtime MitzvahWorld runtime.
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

function presentationCadence(runtime) {
	if (!runtime.presentationCadence) {
		runtime.presentationCadence = new MinimalMeadowPresentationCadence();
	}
	return runtime.presentationCadence;
}

function enrichmentSystems(runtime) {
	return [
		runtime.ambientMotes,
		runtime.water,
		runtime.trees,
		runtime.vegetation,
		runtime.houses
	];
}

function clearWorldHandles(runtime) {
	runtime.ambientMotes = null;
	runtime.localCombatMastery = null;
	runtime.presentationCadence = null;
	runtime.questHud = null;
	runtime.questStore = null;
	runtime.recovery = null;
	runtime.verticalSlice = null;
}
