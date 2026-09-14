//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzCanonicalPlayerPromotion.js
 * @description Starts only the existing authored Chossid hydration branch for rich worlds before regional post-play work waits on it.
 * The Awtsmoos gives the promised vessel its living light before the clock asks whether revelation arrived;
 * Awtsmoos.com opens the already-built GLB doorway alone, so no false person appears and no unrelated optional forest wakes beside.
 */

import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';

const OPTIONAL_CHUNK_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-optional.compact.js',
	import.meta.url,
	'EretzCanonicalPlayerPromotion.js'
);

/**
 * Starts one stable canonical-player promise using the generated optional player export.
 * @param {object} runtime Live Eretz runtime.
 * @param {object} environment Browser/runtime environment.
 * @param {object} dependencies Optional importer/module substitutions for verification.
 * @returns {Promise<object|null>} Canonical player receipt or honest null absence.
 */
export function startEretzCanonicalPlayerPromotion(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.canonicalPlayer?.status === 'ready') {
		return Promise.resolve(runtime.canonicalPlayer);
	}
	if (runtime.canonicalPlayerLaunchPromise) return runtime.canonicalPlayerLaunchPromise;
	if (runtime.canonicalPlayerPromise) {
		runtime.canonicalPlayerLaunchPromise = runtime.canonicalPlayerPromise;
		return runtime.canonicalPlayerLaunchPromise;
	}
	const importer = dependencies.importer || (specifier => import(specifier));
	runtime.canonicalPlayerPromotionStage = 'loading-module';
	const launchPromise = Promise.resolve()
		.then(() => dependencies.module || importer(OPTIONAL_CHUNK_URL))
		.then(module => {
			runtime.canonicalPlayerPromotionStage = 'hydrating-player';
			return module.hydrateMinimalMeadowPlayer(runtime, environment);
		})
		.then(receipt => {
			runtime.canonicalPlayerPromotionStage = receipt?.status === 'ready'
				? 'ready'
				: 'settled-without-player';
			return receipt;
		})
		.catch(error => {
			runtime.canonicalPlayerPromotionStage = 'failed';
			runtime.canonicalPlayerPromotionError = error;
			throw error;
		});
	runtime.canonicalPlayerLaunchPromise = launchPromise;
	return launchPromise;
}

export default startEretzCanonicalPlayerPromotion;
