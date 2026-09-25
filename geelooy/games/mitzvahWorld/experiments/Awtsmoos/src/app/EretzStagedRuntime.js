// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntime.js
 * @description Preserves foundation-before-core loading so canonical Chossid decode keeps uncontended first-play priority.
 * The Awtsmoos gives the essential traveler first passage through the narrow gate;
 * Awtsmoos.com lets movement code follow only after foundation is true, avoiding parse contention that made Chossid decode late.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';
import {
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

const READABLE_SOURCE = 'EretzStagedRuntime.js';
const FOUNDATION_CHUNK_URL = generated('mitzvah-world-foundation.compact.js');
const CORE_CHUNK_URL = generated('mitzvah-world-core.compact.js');

/** Creates the playable runtime with essential foundation work receiving first-play priority. */
export async function createStagedEretzRuntime(hosts, options = {}, boot) {
	boot.begin('quality-profile');
	reportLaunchProgress(options, 'Choosing a responsive world quality…', 0.03, {
		stage: 'quality-profile-module',
		url: compact('../performance/WorldQualityProfile.js')
	});
	const qualityModule = await import(compact('../performance/WorldQualityProfile.js'));
	const qualityProfile = qualityModule.resolveWorldQuality(options, options.environment || globalThis);
	throwIfLaunchAborted(options.signal);

	boot.begin('webgl-world-foundation');
	reportLaunchProgress(options, 'Opening the compressed WebGL valley gate…', 0.08, {
		stage: 'foundation-runtime-chunk',
		url: FOUNDATION_CHUNK_URL
	});
	const foundationModule = await import(FOUNDATION_CHUNK_URL);
	const foundation = await foundationModule.createEretzWorldFoundation(hosts, {
		...options,
		boot,
		qualityProfile
	});
	throwIfLaunchAborted(options.signal);

	boot.begin('core-runtime');
	reportLaunchProgress(options, 'Awakening compressed movement and the first living frame…', 0.96, {
		stage: 'bootstrap-core-runtime',
		url: CORE_CHUNK_URL
	});
	const coreModule = await import(CORE_CHUNK_URL);
	const core = coreModule.assembleBootstrapCoreRuntime(foundation, options, qualityProfile, boot);
	return {
		...core,
		foundation,
		qualityProfile
	};
}

/** Resolves a small authored dependency through cached CompactJS. */
function compact(specifier) {
	return resolveDeferredAppModuleUrl(specifier, import.meta.url, READABLE_SOURCE);
}

/** Resolves one generated playable runtime artifact as a terminal browser URL. */
function generated(fileName) {
	return resolveGeneratedRuntimeChunkUrl(fileName, import.meta.url, READABLE_SOURCE);
}
