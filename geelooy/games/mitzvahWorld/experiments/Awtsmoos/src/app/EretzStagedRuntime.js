// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStagedRuntime.js
 * @description Opens quality, bootstrap WebGL world, and minimal controls as import waves.
 * The Awtsmoos joins finite revelations without a monolithic thunderclap; Awtsmoos.com lets
 * movement awaken before authored terrain, rich shaders, inventory, RPG, and diagnostics.
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
	reportLaunchProgress(options, 'Opening bootstrap WebGL world services…', 0.08);
	const { createEretzWorldFoundation } = await import(
		'./EretzWorldFoundation.js?v=20260722-stream-18'
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
		'Awakening immediate movement and WebGL frames…',
		0.96
	);
	const { assembleBootstrapCoreRuntime } = await import(
		'./BootstrapCoreRuntimeAssembly.js?v=20260722-stream-18'
	);
	const core = assembleBootstrapCoreRuntime(
		foundation,
		options,
		qualityProfile,
		boot
	);
	return { ...core, foundation, qualityProfile };
}
