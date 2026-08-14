// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredWorldModelLoader.js
 * @description Loads optional non-tree curated GLBs only after canonical movement is available and the browser is idle.
 * The Awtsmoos reveals the complete procedural valley and deep forest before imported decoration; Awtsmoos.com
 * streams wildlife and props as a degradable extra vessel, never a second structural tree or first-frame dependency.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { loadWorldModelAssets } from '../assets/WorldModelAssetService.js';
import {
	applyDeferredWorldModelStats,
	createDeferredWorldModelState,
	scheduleDeferredWorldModelLoad
} from './DeferredWorldModelLoadState.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';
import { worldModelLoadingPolicy } from './WorldModelLoadingPolicy.js';

export function startDeferredWorldModels(foundation, runtime, diagnostics, options, boot) {
	const policy = worldModelLoadingPolicy(options);
	const state = createDeferredWorldModelState(policy);
	diagnostics.worldModelStatus = state;
	if (!policy.enabled) return Promise.resolve(null);
	return new Promise(resolve => {
		const cancel = scheduleDeferredWorldModelLoad(() => loadModels({
			boot,
			diagnostics,
			foundation,
			policy,
			resolve,
			runtime,
			state
		}), policy.delayMs);
		state.cancel = () => {
			cancel();
			state.status = 'cancelled';
			resolve(null);
		};
	});
}

async function loadModels(context) {
	if (context.state.status === 'cancelled') {
		context.resolve(null);
		return;
	}
	context.state.status = 'loading';
	context.state.startedAt = performance.now();
	try {
		const service = await loadWorldModelAssets(context.foundation, {
			quality: context.policy.quality
		});
		context.runtime.worldModels = service;
		context.runtime.materialCanonicalization = canonicalizeSceneMaterials(
			context.foundation.scene
		);
		context.diagnostics.worldModels = service;
		context.diagnostics.worldModelStats = service.stats();
		applyDeferredWorldModelStats(context.state, context.diagnostics.worldModelStats);
		if (context.diagnostics.worldModelStats.failed.length) {
			context.boot.degrade(
				'world-models',
				new Error('Some explicitly requested curated GLBs failed to load.')
			);
		}
		refreshWorldDiagnostics(context.diagnostics, context.runtime);
		context.resolve(service);
	} catch (error) {
		context.state.error = error.message;
		context.state.status = 'failed';
		context.runtime.worldModelError = error.message;
		context.boot.degrade('world-models', error);
		refreshWorldDiagnostics(context.diagnostics, context.runtime);
		context.resolve(null);
	}
}

export default startDeferredWorldModels;
