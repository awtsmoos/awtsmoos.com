// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowOptionalHydration.js
 * @description Settles seven named full-quality branches inside explicit production deadlines.
 * The Awtsmoos lets player, renderer, world, earth, Chossid, proof, and measured pulse arrive together;
 * Awtsmoos.com preserves the quiet window while no hidden promise can imprison readiness forever.
 */

import {
	resolveGeneratedRuntimeChunkUrl
} from './GeneratedRuntimeChunkUrl.js';
import {
	createMinimalMeadowOptionalBranch,
	minimalMeadowOptionalBranchTimeouts
} from './MinimalMeadowOptionalBranch.js';
import {
	scheduleMinimalMeadowPerformanceMonitor
} from './MinimalMeadowPerformanceHydration.js';
import {
	scheduleMinimalMeadowTerrainHydration
} from './MinimalMeadowTerrainHydrationSchedule.js';

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
	const terrainSchedule = scheduleMinimalMeadowTerrainHydration(runtime, environment);
	const afterHandoff = callback => dependencies.handoffPromise.then(callback);
	const timeouts = minimalMeadowOptionalBranchTimeouts();
	const branches = [
		branch('player', module.hydrateMinimalMeadowPlayer(runtime, environment), timeouts, environment),
		branch('renderer', module.enhanceMinimalMeadowRenderer(runtime, environment), timeouts, environment),
		branch('richWorld', afterHandoff(() => runtime.richWorldPromise), timeouts, environment),
		branch('friendly', afterHandoff(() => {
			return module.installMinimalMeadowFriendlyNpcs(runtime, environment);
		}), timeouts, environment),
		branch('visual', afterHandoff(() => {
			return module.awaitMinimalMeadowVisualStability(runtime);
		}), timeouts, environment),
		branch('performance', afterHandoff(() => {
			return scheduleMinimalMeadowPerformanceMonitor(runtime, environment);
		}), timeouts, environment),
		branch('terrain', terrainSchedule?.promise || Promise.resolve({
			phase: 'unavailable'
		}), timeouts, environment)
	];
	const results = await Promise.allSettled(branches);
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

function branch(name, promise, timeouts, environment) {
	return createMinimalMeadowOptionalBranch(
		name,
		promise,
		timeouts[name],
		environment
	);
}

function optionalReceipt(results) {
	const fulfilled = results.filter(result => result.status === 'fulfilled')
		.map(result => result.value);
	return Object.freeze({
		branches: Object.freeze(Object.fromEntries(fulfilled.map(value => [value.name, value]))),
		failures: Object.freeze(results.flatMap(result => {
			return result.status === 'rejected'
				? [result.reason?.message || String(result.reason)]
				: [];
		})),
		ready: true,
		results: Object.freeze(results.map(result => result.status))
	});
}
