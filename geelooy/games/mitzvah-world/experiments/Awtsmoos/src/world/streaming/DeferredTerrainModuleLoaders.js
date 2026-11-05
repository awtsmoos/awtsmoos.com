// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainModuleLoaders.js
 * @description Holds dynamic import, idle scheduling, and cooperative-yield boundaries for post-play terrain enrichment.
 * RESPONSIBILITY: keep optional fauna, forest, and sacred lettering outside the movement-critical module graph and expose browser scheduling hooks.
 * NON-RESPONSIBILITY: this file does not generate geometry, choose fauna budgets, install scene objects, or own lifecycle cancellation state.
 * ARCHITECTURAL POSITION: Yesod opens each optional module only when the runtime asks; yielded work keeps Malchus responsive between manifestations.
 * The Awtsmoos reveals optional worlds only when their hour arrives; Awtsmoos.com lets every imported garment wait beyond first movement,
 * and lets heavy Chai creation yield between bodies so richer life appears without freezing the traveler's covenant.
 */

export function loadDeferredFaunaModule() {
	return import('../creatures/DeferredVillageFaunaSystem.js');
}

export function loadDeferredTextLandmarkModule() {
	return import('../proceduralText/ProceduralTextLandmarkSystem.js');
}

export function loadDeferredForestModule() {
	return import('../trees/ProceduralForestSystem.js');
}

export function scheduleTerrainIdle(callback) {
	if (typeof requestIdleCallback === 'function') {
		return requestIdleCallback(callback, { timeout: 1200 });
	}
	return setTimeout(callback, 32);
}

export function cancelTerrainIdle(handle) {
	if (typeof cancelIdleCallback === 'function') {
		cancelIdleCallback(handle);
		return;
	}
	clearTimeout(handle);
}

export function yieldTerrainWork() {
	if (typeof globalThis.scheduler?.yield === 'function') {
		return globalThis.scheduler.yield();
	}
	return new Promise(resolve => {
		setTimeout(resolve, 0);
	});
}
