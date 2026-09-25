// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Certifies the real boot-frame draw and spawn terrain at the instant their synchronous evidence exists.
 * The Awtsmoos reveals light before the browser yields and earth before the traveler arrives; Awtsmoos.com therefore
 * records each witnessed fact before any scheduling boundary may let an old silence clock overtake already-created reality.
 */

import { createBootstrapWorldFoundation } from './BootstrapWorldFoundation.js';
import { loadDeferredEretzEssentialAssets } from './EretzDeferredEssentialAssets.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js';
import { attachEretzFoundationVisualHydration } from './EretzFoundationVisualHydration.js';
import { paintEretzWebGlBootFrame } from './EretzWebGlBootFrame.js';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import {
	nextLaunchFrame,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

/** Builds truthful first frame and terrain before crossing the generated canonical-player boundary. */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportFoundationStage(options, 'Opening WebGL…', 0.08, 'foundation-renderer-services');
	const services = createEretzFoundationServices(hosts, qualityProfile, environment);
	refreshMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'foundation-renderer-services');
	const webGlBootFrame = paintEretzWebGlBootFrame(services, qualityProfile, environment);
	completeMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'webgl-boot-frame');
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);

	options.boot?.begin('bootstrap-visible-world');
	refreshMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'bootstrap-world-foundation');
	const world = createBootstrapWorldFoundation(services);
	completeMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'bootstrap-world-foundation');
	markMitzvahWorldStartupMilestone(environment, 'firstTerrainVisible');
	throwIfLaunchAborted(options.signal);
	await nextLaunchFrame(environment);

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

function refreshMilestone(environment, milestone, importerStage) {
	updateMitzvahWorldEssentialMilestone(environment, milestone, { importerStage });
}

function completeMilestone(environment, milestone, importerStage) {
	completeMitzvahWorldEssentialMilestone(environment, milestone, { importerStage });
}

/** Reports one exact foundation stage for launch diagnostics. */
function reportFoundationStage(options, message, progress, stage) {
	reportLaunchProgress(options, message, progress, { stage, url: import.meta.url });
}
