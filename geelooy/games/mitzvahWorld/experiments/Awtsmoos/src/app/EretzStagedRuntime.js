// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntime.js
 * @description Hydrates the canonical world and prepares real movement code concurrently, with actual control proof still required.
 * The Awtsmoos holds the traveler and the path in one renewing light;
 * Awtsmoos.com opens the movement gate while the meadow forms, not after the meadow leaves the gate out of sight.
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

/**
 * Begins the real core module's loading alongside terrain and GLB hydration.
 * Wrapping errors avoids an unhandled rejection during long foundation startup;
 * the real failure is rethrown at the ordinary required core boundary.
 */
function beginMovementCoreImport() {
	return import(CORE_CHUNK_URL).then(
		module => ({ module, error: null }),
		error => ({ module: null, error })
	);
}

/** Creates one authentic first-control world before richer subsystems are mounted. */
export async function createStagedEretzRuntime(hosts, options = {}, boot) {
	const environment = options.environment || globalThis;
	const document = environment.document || globalThis.document;
	const startedAt = environment.performance?.now?.() ?? Date.now();
	const movementCorePromise = beginMovementCoreImport();

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
	const coreReceipt = await movementCorePromise;
	if (coreReceipt.error) throw coreReceipt.error;
	throwIfLaunchAborted(options.signal);
	const core = coreReceipt.module.assembleBootstrapEssentialPrime(
		foundation,
		options,
		qualityProfile,
		boot
	);
	const completedAt = environment.performance?.now?.() ?? Date.now();
	core.runtime.essentialAssemblyMilliseconds = Math.max(0, completedAt - startedAt);
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
