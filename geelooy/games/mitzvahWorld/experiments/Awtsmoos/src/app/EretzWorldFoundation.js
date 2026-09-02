// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Opens WebGL capability, canonical player assets, and the bootstrap valley while withholding gameplay until authored visuals are real.
 * The Awtsmoos reveals traveler, earth, and sky through one truthful threshold; Awtsmoos.com keeps loading visible while rich WebGL and texture arrive,
 * so no flat green field or generated human is published as gameplay merely because a faster placeholder can survive.
 */

import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import { resolveResponsiveRuntimeModuleUrl } from './ResponsiveRuntimeModuleUrl.js';
import {
	nextLaunchFrame,
	nextLaunchTask,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

/** Creates the visible world only after canonical player and authored visual prerequisites complete. */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportLaunchProgress(options, 'Loading responsive WebGL controls…', 0.12);
	const [servicesModule, bootFrameModule] = await Promise.all([
		import(responsive('./EretzFoundationServices.js?v=20260827-responsive-services-01')),
		import(responsive('./EretzWebGlBootFrame.js?v=20260827-responsive-frame-01'))
	]);
	throwIfLaunchAborted(options.signal);
	const services = servicesModule.createEretzFoundationServices(hosts, qualityProfile, environment);
	const webGlBootFrame = bootFrameModule.paintEretzWebGlBootFrame(services, qualityProfile, environment);
	await nextLaunchFrame(environment);
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('essential-assets');
	reportLaunchProgress(options, 'Loading the authored Chossid…', 0.38);
	const assetModule = await import(responsive(
		'./EretzEssentialAssetLoader.js?v=20260902-glb-only-player-01'
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
	reportLaunchProgress(options, 'Preparing authored meadow and sky…', 0.72);
	const worldModule = await import(responsive(
		'./BootstrapWorldFoundation.js?v=20260827-responsive-valley-01'
	));
	const world = worldModule.createBootstrapWorldFoundation(services);
	const visualModule = await import(responsive(
		'./EretzEssentialVisualGate.js?v=20260902-authored-first-frame-01'
	));
	await visualModule.prepareEretzEssentialVisuals({
		boot: options.boot,
		renderer: services.renderer,
		signal: options.signal,
		terrain: world.terrain
	});
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

function responsive(specifier) {
	return resolveResponsiveRuntimeModuleUrl(specifier, import.meta.url);
}

function markVisibleWorldReady(options) {
	options.boot?.progress?.(
		'bootstrap-visible-world',
		1,
		1,
		'Authored Chossid, meadow textures, and WebGL sky ready.',
		'ready'
	);
}
