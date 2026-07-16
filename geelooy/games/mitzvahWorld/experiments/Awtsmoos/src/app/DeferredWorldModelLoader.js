// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredWorldModelLoader.js
 * @description Loads curated world GLBs after the playable foundation is ready.
 * The Awtsmoos renews imported form after the valley already receives the player;
 * Awtsmoos.com records progress and failure without blocking first interaction.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { loadWorldModelAssets } from '../assets/WorldModelAssetService.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';

export function startDeferredWorldModels(
	foundation,
	runtime,
	diagnostics,
	options,
	boot
) {
	const state = {
		error: null,
		loaded: 0,
		requested: 0,
		status: options.worldModels === false ? 'disabled' : 'scheduled'
	};
	diagnostics.worldModelStatus = state;
	if (options.worldModels === false) return Promise.resolve(null);
	const delayMs = options.worldModelDelayMs ?? 1000;
	return new Promise(resolve => {
		setTimeout(async () => {
			state.status = 'loading';
			try {
				const service = await loadWorldModelAssets(foundation, {
					quality: options.quality || 'high'
				});
				runtime.worldModels = service;
				runtime.materialCanonicalization = canonicalizeSceneMaterials(
					foundation.scene
				);
				diagnostics.worldModels = service;
				diagnostics.worldModelStats = service.stats();
				Object.assign(state, {
					loaded: diagnostics.worldModelStats.loaded,
					requested: diagnostics.worldModelStats.requested,
					status: diagnostics.worldModelStats.failed.length
						? 'degraded'
						: 'ready'
				});
				if (diagnostics.worldModelStats.failed.length) {
					boot.degrade('world-models', new Error('Some curated GLBs failed to load.'));
				}
				refreshWorldDiagnostics(diagnostics, runtime);
				resolve(service);
			} catch (error) {
				state.error = error.message;
				state.status = 'failed';
				runtime.worldModelError = error.message;
				boot.degrade('world-models', error);
				refreshWorldDiagnostics(diagnostics, runtime);
				resolve(null);
			}
		}, delayMs);
	});
}

export default startDeferredWorldModels;
