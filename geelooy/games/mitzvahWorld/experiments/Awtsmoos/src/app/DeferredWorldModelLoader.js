// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredWorldModelLoader.js
 * @description Loads optional curated GLBs only after movement is available and the browser is idle.
 * The Awtsmoos reveals the complete procedural valley before imported decoration; Awtsmoos.com
 * waits for a quiet finite moment so optional beauty never steals the first responsive frame.
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
	if (!policy.enabled) {
		return Promise.resolve(null);
	}
	return new Promise(resolve => {
		const cancel = scheduleIdleLoad(() => loadModels({
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

function scheduleIdleLoad(callback, delayMilliseconds) {
	let cancelled = false;
	let idleHandle = null;
	let timeoutHandle = null;
	const invoke = () => {
		if (!cancelled) {
			callback();
		}
	};
	timeoutHandle = setTimeout(() => {
		if (cancelled) {
			return;
		}
		if (typeof requestIdleCallback === 'function') {
			idleHandle = requestIdleCallback(invoke, { timeout: 1800 });
			return;
		}
		queueMicrotask(invoke);
	}, Math.max(0, delayMilliseconds));
	return () => {
		cancelled = true;
		clearTimeout(timeoutHandle);
		if (idleHandle != null && typeof cancelIdleCallback === 'function') {
			cancelIdleCallback(idleHandle);
		}
	};
}

function createState(policy) {
	return {
		cancel: null,
		error: null,
		loaded: 0,
		policy: policy.reason,
		requested: 0,
		startedAt: null,
		status: policy.enabled ? 'scheduled-idle' : 'disabled-by-default'
	};
}

function applyServiceState(state, stats) {
	Object.assign(state, {
		cancel: null,
		loaded: stats.loaded,
		requested: stats.requested,
		status: stats.failed.length ? 'degraded' : 'ready'
	});
}

export default startDeferredWorldModels;
