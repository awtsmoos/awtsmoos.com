// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Proves WebGL frame and spawn terrain from a lean foundation chunk, then crosses the generated essential-player boundary for the canonical Chossid.
 * The Awtsmoos gives visible earth and first light their own swift vessels before the authored traveler enters his bounded generated garment;
 * Awtsmoos.com keeps renderer and terrain independent of Chossid while the real Chossid remains mandatory before movement may awake.
 */

import { createBootstrapWorldFoundation } from './BootstrapWorldFoundation.js';
import { loadDeferredEretzEssentialAssets } from './EretzDeferredEssentialAssets.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js';
import { attachEretzFoundationVisualHydration } from './EretzFoundationVisualHydration.js';
import { paintEretzWebGlBootFrame } from './EretzWebGlBootFrame.js';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES
} from './MitzvahWorldEssentialBoot.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import {
	nextLaunchFrame,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

/** Builds first frame and terrain before loading the generated canonical-player runtime chunk. */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportFoundationStage(options, 'Opening WebGL…', 0.08, 'foundation-renderer-services');
	const services = createEretzFoundationServices(hosts, qualityProfile, environment);
	const webGlBootFrame = paintEretzWebGlBootFrame(services, qualityProfile, environment);
	await nextLaunchFrame(environment);
	completeMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
		{ importerStage: 'webgl-boot-frame' }
	);
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);

	options.boot?.begin('bootstrap-visible-world');
	const world = createBootstrapWorldFoundation(services);
	completeMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
		{ importerStage: 'bootstrap-world-foundation' }
	);
	markMitzvahWorldStartupMilestone(environment, 'firstTerrainVisible');
	throwIfLaunchAborted(options.signal);

	reportFoundationStage(options, 'Loading authored player…', 0.42, 'generated-essential-player');
	const loaded = await loadDeferredEretzEssentialAssets({
		...options,
		boot: options.boot,
		environment,
		quality: qualityProfile.quality
	});
	throwIfLaunchAborted(options.signal);

	const foundation = {
		hosts,
		...hosts,
		...loaded,
		...services,
		...world,
		environment,
		qualityProfile,
		webGlBootFrame
	};
	return attachEretzFoundationVisualHydration(foundation, options, environment);
}

/** Reports one exact foundation stage for launch diagnostics. */
function reportFoundationStage(options, message, progress, stage) {
	reportLaunchProgress(options, message, progress, {
		stage,
		url: import.meta.url
	});
}
