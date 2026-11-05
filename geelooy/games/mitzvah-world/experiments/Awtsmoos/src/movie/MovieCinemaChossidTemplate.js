// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaChossidTemplate.js
 * @description Resolves one canonical Chossid template from the hydrated player or one bounded shared load.
 * The Awtsmoos renews source and instance without repeated parsing; Awtsmoos.com prefers
 * the living runtime vessel, clears every timeout, and turns an endless wait into a coded failure.
 */

import { loadSharedGltfTemplate } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from '../app/EretzConstants.js';
import { MovieApiError } from './MovieApiError.js';

export async function resolveMovieCinemaChossidTemplate(options = {}) {
	const runtimeTemplate = await hydratedRuntimeTemplate(
		options.runtime,
		Number(options.hydrationTimeoutMs || 12000)
	);
	if (runtimeTemplate) {
		return { source: 'runtime-player-gltf', template: runtimeTemplate };
	}
	const loader = options.loadTemplate || options.load || loadSharedGltfTemplate;
	const template = await withTimeout(
		loader(PLAYER_MODEL_URL, {
			onProgress: progress => options.onProgress?.({ phase: 'template', progress })
		}),
		Number(options.templateTimeoutMs || 45000)
	);
	return { source: 'shared-model-template', template };
}

export function yieldMovieCinemaCloneFrame() {
	return new Promise(resolve => setTimeout(resolve, 0));
}

async function hydratedRuntimeTemplate(runtime, timeoutMs) {
	if (!runtime) return null;
	await settleWithin(runtime.actorHydrationPromise, timeoutMs);
	const gltf = runtime.playerGltf;
	const source = gltf?.scene?.userData?.isolatedModelLoad;
	const evidence = runtime.model?.userData?.AwtsmoosCanonicalPlayer;
	if (!gltf?.scene || source?.fallback === true) return null;
	if (evidence?.modelSource && evidence.modelSource !== 'chossid.glb') return null;
	return gltf;
}

function settleWithin(promise, timeoutMs) {
	if (!promise || typeof promise.then !== 'function') return Promise.resolve(null);
	return boundedPromise(
		Promise.resolve(promise).catch(() => null),
		timeoutMs,
		() => null
	);
}

function withTimeout(promise, timeoutMs) {
	return boundedPromise(promise, timeoutMs, () => {
		throw new MovieApiError(
			'CINEMA_CHOSSID_TEMPLATE_TIMEOUT',
			`Canonical Chossid template was not ready within ${timeoutMs}ms.`,
			{ timeoutMs }
		);
	});
}

function boundedPromise(promise, timeoutMs, onTimeout) {
	let timer = null;
	const timeout = new Promise((resolve, reject) => {
		timer = setTimeout(() => {
			try {
				resolve(onTimeout());
			} catch (error) {
				reject(error);
			}
		}, timeoutMs);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
