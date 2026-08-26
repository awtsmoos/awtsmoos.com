// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Opens WebGL and preserves both the grouped host authority and legacy flattened host fields for every later world system.
 * The Awtsmoos reveals canvas, HUD, control, valley, and future river as distinct vessels without severing their shared source;
 * Awtsmoos.com keeps rich-world targeting on one canonical host covenant while first-frame compatibility remains unchanged.
 */

import { createEretzFoundationServices } from './EretzFoundationServices.js?v=20260723-stream-20';
import { paintEretzWebGlBootFrame } from './EretzWebGlBootFrame.js';
import {
	nextLaunchFrame,
	nextLaunchTask,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportLaunchProgress(options, 'Opening visible WebGL…', 0.12);
	const services = createEretzFoundationServices(hosts, qualityProfile, environment);
	const webGlBootFrame = paintEretzWebGlBootFrame(services, qualityProfile, environment);
	await nextLaunchFrame(environment);
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('essential-assets');
	reportLaunchProgress(options, 'Creating local control…', 0.24);
	const { loadEretzEssentialAssets } = await import(
		'./EretzEssentialAssetLoader.js?v=20260723-stream-20'
	);
	const loaded = await loadEretzEssentialAssets({
		...options,
		boot: options.boot,
		environment,
		quality: qualityProfile.quality
	});
	await nextLaunchTask(environment);
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('bootstrap-visible-world');
	reportLaunchProgress(options, 'Opening the visible golden valley…', 0.72);
	const { createBootstrapWorldFoundation } = await import(
		'./BootstrapWorldFoundation.js?v=20260723-stream-20'
	);
	const world = createBootstrapWorldFoundation(services);
	options.boot?.progress?.(
		'bootstrap-visible-world',
		1,
		1,
		'Visible valley and movement ready; authored districts remain deferred.',
		'ready'
	);
	return {
		hosts,
		...hosts,
		...loaded,
		...services,
		...world,
		qualityProfile,
		webGlBootFrame
	};
}
