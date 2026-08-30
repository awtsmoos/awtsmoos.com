//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntime.js
 * @description Keeps orchestration tiny while the immediately playable foundation and core cross two bounded generated CompactJS artifacts instead of a cold source-module waterfall.
 * The Awtsmoos joins swift doorway and measured depth in one living stream; Awtsmoos.com lets a tiny valley gate and one modest core garment arrive,
 * while presentation, distant worlds, Creator abundance, and optional beauty remain deferred beyond the player's first moving dream.
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

/** Creates the playable runtime through small compact orchestration and two bounded generated artifacts. */
export async function createStagedEretzRuntime(hosts, options = {}, boot) {
	boot.begin('quality-profile');
	const qualityModule = await import(compact('../performance/WorldQualityProfile.js'));
	const qualityProfile = qualityModule.resolveWorldQuality(
		options,
		options.environment || globalThis
	);
	throwIfLaunchAborted(options.signal);
	boot.begin('webgl-world-foundation');
	reportLaunchProgress(options, 'Opening the compressed WebGL valley gate…', 0.08);
	const foundationModule = await import(FOUNDATION_CHUNK_URL);
	const foundation = await foundationModule.createEretzWorldFoundation(hosts, {
		...options,
		boot,
		qualityProfile
	});
	throwIfLaunchAborted(options.signal);
	boot.begin('core-runtime');
	reportLaunchProgress(
		options,
		'Awakening compressed movement and the first living frame…',
		0.96
	);
	const coreModule = await import(CORE_CHUNK_URL);
	const core = coreModule.assembleBootstrapCoreRuntime(
		foundation,
		options,
		qualityProfile,
		boot
	);
	return {
		...core,
		foundation,
		qualityProfile
	};
}

/** Resolves a small authored dependency through cached CompactJS. */
function compact(specifier) {
	return resolveDeferredAppModuleUrl(
		specifier,
		import.meta.url,
		READABLE_SOURCE
	);
}

/** Resolves one already-generated playable runtime artifact as a terminal browser URL. */
function generated(fileName) {
	return resolveGeneratedRuntimeChunkUrl(
		fileName,
		import.meta.url,
		READABLE_SOURCE
	);
}
