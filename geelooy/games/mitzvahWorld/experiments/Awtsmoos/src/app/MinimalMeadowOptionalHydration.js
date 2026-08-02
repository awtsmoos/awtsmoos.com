// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowOptionalHydration.js
 * @description Hydrates full optional quality through one deterministic compressed runtime chunk.
 * The Awtsmoos lets canonical player, renderer, friendly Chossid, and visual proof arrive together;
 * Awtsmoos.com preserves complete quality while eliminating the native source-module waterfall.
 */

import {
	resolveGeneratedRuntimeChunkUrl
} from './GeneratedRuntimeChunkUrl.js';

const OPTIONAL_CHUNK_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-optional.compact.js',
	import.meta.url,
	'MinimalMeadowOptionalHydration.js'
);

export async function hydrateMinimalMeadowOptionalFeatures(
	runtime,
	environment,
	dependencies
) {
	const module = await resolveOptionalModule(dependencies);
	const afterHandoff = callback => dependencies.handoffPromise.then(callback);
	const results = await Promise.allSettled([
		module.hydrateMinimalMeadowPlayer(runtime, environment),
		module.enhanceMinimalMeadowRenderer(runtime, environment),
		afterHandoff(() => runtime.richWorldPromise),
		afterHandoff(() => {
			return module.installMinimalMeadowFriendlyNpcs(runtime, environment);
		}),
		afterHandoff(() => {
			return module.awaitMinimalMeadowVisualStability(runtime);
		})
	]);
	const receipt = optionalReceipt(results);
	runtime.optionalFeatureReceipt = receipt;
	runtime.bus?.emit?.('world:optional-ready', receipt);
	return receipt;
}

async function resolveOptionalModule(dependencies) {
	if (dependencies.modules) return dependencies.modules;
	const importer = dependencies.importer || (specifier => import(specifier));
	return importer(OPTIONAL_CHUNK_URL);
}

function optionalReceipt(results) {
	return Object.freeze({
		failures: Object.freeze(results.flatMap(result => {
			return result.status === 'rejected'
				? [result.reason?.message || String(result.reason)]
				: [];
		})),
		ready: true,
		results: Object.freeze(results.map(result => result.status))
	});
}
