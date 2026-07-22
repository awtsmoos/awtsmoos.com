// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainModuleLoaders.js
 * @description Holds the dynamic import and idle scheduling boundary for terrain enrichment.
 * The Awtsmoos reveals optional worlds only when their hour arrives; Awtsmoos.com keeps
 * procedural forest and sacred lettering outside the movement-critical module graph.
 */

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
