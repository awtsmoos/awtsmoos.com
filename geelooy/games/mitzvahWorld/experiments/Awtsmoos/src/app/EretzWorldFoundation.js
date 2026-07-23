// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Opens progressive WebGL, essential control, and a flat bootstrap world.
 * The Awtsmoos reveals movement before the authored valley; Awtsmoos.com keeps terrain CSG,
 * houses, roads, water, forests, textures, octrees, and village districts outside first startup.
 */

import { createEretzFoundationServices } from './EretzFoundationServices.js?v=20260722-stream-18';
import { paintEretzWebGlBootFrame } from './EretzWebGlBootFrame.js';
import {
	nextLaunchFrame,
	nextLaunchTask,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) {
		throw new Error('Eretz foundation requires a quality profile.');
	}
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportLaunchProgress(options, 'Opening progressive WebGL…', 0.12);
	const services = createEretzFoundationServices(
		hosts,
		qualityProfile,
		environment
	);
	const webGlBootFrame = paintEretzWebGlBootFrame(
		services,
		qualityProfile,
		environment
	);
	await nextLaunchFrame(environment);
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('essential-assets');
	reportLaunchProgress(options, 'Creating the local control vessel…', 0.24);
	const { loadEretzEssentialAssets } = await import(
		'./EretzEssentialAssetLoader.js?v=20260722-stream-18'
	);
	const loaded = await loadEretzEssentialAssets({
		...options,
		boot: options.boot,
		environment,
		quality: qualityProfile.quality
	});
	await nextLaunchTask(environment);
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('bootstrap-flat-world');
	reportLaunchProgress(options, 'Opening flat movement ground…', 0.72);
	const { createBootstrapWorldFoundation } = await import(
		'./BootstrapWorldFoundation.js?v=20260722-stream-18'
	);
	const world = createBootstrapWorldFoundation(services);
	options.boot?.progress?.(
		'bootstrap-flat-world',
		1,
		1,
		'Flat movement ground ready; authored valley remains dormant.',
		'ready'
	);
	return {
		...hosts,
		...loaded,
		...services,
		...world,
		qualityProfile,
		webGlBootFrame
	};
}
