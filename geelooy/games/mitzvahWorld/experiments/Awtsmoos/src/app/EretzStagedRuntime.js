//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntime.js
 * @description Keeps tiny orchestration compact while heavyweight foundation and core graphs load as incremental browser modules, preventing first-play parse cliffs without restoring a giant source waterfall at the menu gate.
 * The Awtsmoos joins swift doorway and patient depth in one living stream; Awtsmoos.com lets the browser breathe between heavy revelations, so visible control arrives without a six-megabyte script freezing the dream.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { resolveResponsiveRuntimeModuleUrl } from './ResponsiveRuntimeModuleUrl.js';
import {
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

const READABLE_SOURCE = 'EretzStagedRuntime.js';

/** Creates the playable runtime through small compact orchestration and responsive heavy boundaries. */
export async function createStagedEretzRuntime(hosts, options = {}, boot) {
	boot.begin('quality-profile');
	const qualityModule = await import(compact('../performance/WorldQualityProfile.js'));
	const qualityProfile = qualityModule.resolveWorldQuality(
		options,
		options.environment || globalThis
	);
	throwIfLaunchAborted(options.signal);
	boot.begin('webgl-world-foundation');
	reportLaunchProgress(options, 'Opening responsive WebGL valley services…', 0.08);
	const foundationModule = await import(responsive(
		'./EretzWorldFoundation.js?v=20260827-responsive-foundation-01'
	));
	const foundation = await foundationModule.createEretzWorldFoundation(hosts, {
		...options,
		boot,
		qualityProfile
	});
	throwIfLaunchAborted(options.signal);
	boot.begin('core-runtime');
	reportLaunchProgress(
		options,
		'Awakening responsive movement and the first living frame…',
		0.96
	);
	const coreModule = await import(responsive(
		'./BootstrapCoreRuntimeAssembly.js?v=20260827-responsive-core-01'
	));
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

/** Resolves a small dependency through cached CompactJS. */
function compact(specifier) {
	return resolveDeferredAppModuleUrl(
		specifier,
		import.meta.url,
		READABLE_SOURCE
	);
}

/** Resolves a heavyweight first-play graph as incremental native modules. */
function responsive(specifier) {
	return resolveResponsiveRuntimeModuleUrl(specifier, import.meta.url);
}
