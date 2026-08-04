// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntime.js
 * @description Opens quality, visible WebGL, controls, combat, and a real map as import waves.
 * The Awtsmoos joins finite revelations without a monolithic thunderclap;
 * Awtsmoos.com lets movement, deed, and direction awaken before authored terrain and rich actors.
 */

import {
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

export async function createStagedEretzRuntime(hosts, options = {}, boot) {
	boot.begin('quality-profile');
	const { resolveWorldQuality } = await import(
		'../performance/WorldQualityProfile.js'
	);
	const qualityProfile = resolveWorldQuality(
		options,
		options.environment || globalThis
	);
	throwIfLaunchAborted(options.signal);
	boot.begin('webgl-world-foundation');
	reportLaunchProgress(options, 'Opening visible WebGL valley services…', 0.08);
	const { createEretzWorldFoundation } = await import(
		'./EretzWorldFoundation.js?v=20260723-stream-20'
	);
	const foundation = await createEretzWorldFoundation(hosts, {
		...options,
		boot,
		qualityProfile
	});
	throwIfLaunchAborted(options.signal);
	boot.begin('core-runtime');
	reportLaunchProgress(
		options,
		'Awakening movement, combat, map, and colored WebGL frames…',
		0.96
	);
	const { assembleBootstrapCoreRuntime } = await import(
		'./BootstrapCoreRuntimeAssembly.js?v=20260804-map-01'
	);
	const core = assembleBootstrapCoreRuntime(
		foundation,
		options,
		qualityProfile,
		boot
	);
	return { ...core, foundation, qualityProfile };
}
