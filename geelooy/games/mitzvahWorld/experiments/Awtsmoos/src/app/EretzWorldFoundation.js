// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Opens WebGL, local bootstrap assets, and a visible meadow while reporting the exact module gate currently awaited.
 * The Awtsmoos gives earth beneath the foot before distant beauty descends; Awtsmoos.com reveals a playable valley first,
 * and names each finite doorway so renderer, traveler, or meadow failure can never hide behind an eternal zero-percent night.
 */

import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import { resolveResponsiveRuntimeModuleUrl } from './ResponsiveRuntimeModuleUrl.js';
import {
	nextLaunchFrame,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

/** Creates the minimum visible world required for movement before optional remote enrichment. */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportLaunchProgress(options, 'Opening responsive WebGL controls…', 0.12, {
		stage: 'foundation-renderer-modules',
		url: rendererModuleEvidenceUrl()
	});
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
	reportLaunchProgress(options, 'Preparing the local traveler…', 0.38, {
		stage: 'essential-local-assets',
		url: responsive('./EretzEssentialAssetLoader.js?v=20260907-play-first-assets-01')
	});
	const assetModule = await import(responsive(
		'./EretzEssentialAssetLoader.js?v=20260907-play-first-assets-01'
	));
	const loaded = await assetModule.loadEretzEssentialAssets({
		...options,
		boot: options.boot,
		environment,
		quality: qualityProfile.quality
	});
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('bootstrap-visible-world');
	reportLaunchProgress(options, 'Opening the playable meadow…', 0.72, {
		stage: 'bootstrap-visible-world',
		url: responsive('./BootstrapWorldFoundation.js?v=20260827-responsive-valley-01')
	});
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
		environment,
		qualityProfile,
		webGlBootFrame
	};
}

/** Resolves one responsive runtime import relative to this authored module. */
function responsive(specifier) {
	return resolveResponsiveRuntimeModuleUrl(specifier, import.meta.url);
}

/** Returns both renderer module URLs because the foundation awaits them together. */
function rendererModuleEvidenceUrl() {
	return [
		responsive('./EretzFoundationServices.js?v=20260827-responsive-services-01'),
		responsive('./EretzWebGlBootFrame.js?v=20260827-responsive-frame-01')
	].join(' ; ');
}

/** Marks local playability without claiming remote visual enrichment is complete. */
function markVisibleWorldReady(options) {
	options.boot?.progress?.(
		'bootstrap-visible-world',
		1,
		1,
		'Playable meadow and local traveler shell ready; rich visuals continue after movement.',
		'ready'
	);
}
