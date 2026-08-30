// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Opens foundation services, first WebGL paint, local control, and the bootstrap valley through incremental readable module graphs.
 * The Awtsmoos reveals canvas, traveler, and valley through many breaths that are truly One;
 * Awtsmoos.com marks the renderer only after a yielded frame, while distant richness waits beyond the playable sun.
 */

import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import { resolveResponsiveRuntimeModuleUrl } from './ResponsiveRuntimeModuleUrl.js';
import {
	nextLaunchFrame,
	nextLaunchTask,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

/** Creates visible foundation services, local control assets, and the bootstrap valley. */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) {
		throw new Error('Eretz foundation requires a quality profile.');
	}
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportLaunchProgress(options, 'Loading responsive WebGL controls…', 0.12);
	const [servicesModule, bootFrameModule] = await Promise.all([
		import(responsive('./EretzFoundationServices.js?v=20260827-responsive-services-01')),
		import(responsive('./EretzWebGlBootFrame.js?v=20260827-responsive-frame-01'))
	]);
	throwIfLaunchAborted(options.signal);
	const services = servicesModule.createEretzFoundationServices(
		hosts,
		qualityProfile,
		environment
	);
	const webGlBootFrame = bootFrameModule.paintEretzWebGlBootFrame(
		services,
		qualityProfile,
		environment
	);
	await nextLaunchFrame(environment);
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('essential-assets');
	reportLaunchProgress(options, 'Creating local control…', 0.42);
	const assetModule = await import(responsive(
		'./EretzEssentialAssetLoader.js?v=20260827-responsive-assets-01'
	));
	const loaded = await assetModule.loadEretzEssentialAssets({
		...options,
		boot: options.boot,
		environment,
		quality: qualityProfile.quality
	});
	await nextLaunchTask(environment);
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('bootstrap-visible-world');
	reportLaunchProgress(options, 'Opening the visible golden valley…', 0.78);
	const worldModule = await import(responsive(
		'./BootstrapWorldFoundation.js?v=20260827-responsive-valley-01'
	));
	const world = worldModule.createBootstrapWorldFoundation(services);
	markVisibleWorldReady(options);
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

/** Resolves one heavyweight source boundary without the CompactJS query flag. */
function responsive(specifier) {
	return resolveResponsiveRuntimeModuleUrl(specifier, import.meta.url);
}

/** Publishes the exact visible-world readiness milestone without coupling to later richness. */
function markVisibleWorldReady(options) {
	options.boot?.progress?.(
		'bootstrap-visible-world',
		1,
		1,
		'Visible valley and movement ready; authored districts remain deferred.',
		'ready'
	);
}
