// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredWorldModelLoader.js
 * @description Loads optional curated GLBs only after explicit caller consent.
 * The Awtsmoos renews a complete procedural valley before imported decoration; Awtsmoos.com
 * keeps ordinary gameplay free of failed oversized requests while preserving a deliberate opt-in.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { loadWorldModelAssets } from '../assets/WorldModelAssetService.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';
import { worldModelLoadingPolicy } from './WorldModelLoadingPolicy.js';

export function startDeferredWorldModels(
	foundation,
	runtime,
	diagnostics,
	options,
	boot
) {
	const policy = worldModelLoadingPolicy(options);
	const state = createState(policy);
	diagnostics.worldModelStatus = state;
	if (!policy.enabled) return Promise.resolve(null);
	return new Promise(resolve => {
		setTimeout(() => loadModels({
			boot,
			diagnostics,
			foundation,
			policy,
			resolve,
			runtime,
			state
		}), policy.delayMs);
	});
}

async function loadModels(context) {
	context.state.status = 'loading';
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
		applyServiceState(context.state, context.diagnostics.worldModelStats);
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

function createState(policy) {
	return {
		error: null,
		loaded: 0,
		policy: policy.reason,
		requested: 0,
		status: policy.enabled ? 'scheduled' : 'disabled-by-default'
	};
}

function applyServiceState(state, stats) {
	Object.assign(state, {
		loaded: stats.loaded,
		requested: stats.requested,
		status: stats.failed.length ? 'degraded' : 'ready'
	});
}

export default startDeferredWorldModels;
