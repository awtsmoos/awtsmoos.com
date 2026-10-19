// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntime.js
 * @description Loads foundation first, then only the minimal canonical-player movement prime needed for first control.
 * The Awtsmoos gives the essential traveler first passage through the narrow gate;
 * Awtsmoos.com lets rich animation, combat, HUD, and abundance wait until the Chossid can already walk.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';
import { transitionMitzvahWorldBootState } from './MitzvahWorldBootStateMachine.js';
import {
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

const READABLE_SOURCE = 'EretzStagedRuntime.js';
const FOUNDATION_CHUNK_URL = generated('mitzvah-world-foundation.compact.js');
const CORE_CHUNK_URL = generated('mitzvah-world-core.compact.js');

/** Creates the playable runtime with movement proof ahead of every post-control system. */
export async function createStagedEretzRuntime(hosts, options = {}, boot) {
	const environment = options.environment || globalThis;
	const document = environment.document || globalThis.document;
	boot.begin('quality-profile');
	reportLaunchProgress(options, 'Choosing a responsive world quality…', 0.03, {
		stage: 'quality-profile-module',
		url: compact('../performance/WorldQualityProfile.js')
	});
	const qualityModule = await import(compact('../performance/WorldQualityProfile.js'));
	const qualityProfile = qualityModule.resolveWorldQuality(options, environment);
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
	reportLaunchProgress(options, 'Giving the Chossid movement and the first living frame…', 0.96, {
		stage: 'bootstrap-essential-prime',
		url: CORE_CHUNK_URL
	});
	transitionMitzvahWorldBootState(environment, document, 'world-loading', null);
	const coreModule = await import(CORE_CHUNK_URL);
	const core = coreModule.assembleBootstrapEssentialPrime(foundation, options, qualityProfile, boot);
	return {
		...core,
		foundation,
		qualityProfile
	};
}

function compact(specifier) {
	return resolveDeferredAppModuleUrl(specifier, import.meta.url, READABLE_SOURCE);
}

function generated(fileName) {
	return resolveGeneratedRuntimeChunkUrl(fileName, import.meta.url, READABLE_SOURCE);
}
