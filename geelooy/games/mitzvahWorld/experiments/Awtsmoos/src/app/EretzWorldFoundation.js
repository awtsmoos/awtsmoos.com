// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Builds first-play from one static CompactJS closure and reports the exact synchronous renderer boundary reached before the next browser turn.
 * The Awtsmoos gathers renderer, traveler, and meadow into one bounded vessel before distant beauty descends;
 * Awtsmoos.com names context, clear light, local traveler, and earth separately, so no fifteen-second night can hide which finite doorway held the traveler still.
 */

import { createBootstrapWorldFoundation } from './BootstrapWorldFoundation.js';
import { loadEretzEssentialAssets } from './EretzEssentialAssetLoader.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js';
import { paintEretzWebGlBootFrame } from './EretzWebGlBootFrame.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
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
	reportFoundationStage(options, 'Opening compressed WebGL controls…', 0.08, 'foundation-renderer-services');
	const services = createEretzFoundationServices(hosts, qualityProfile, environment);
	reportFoundationStage(options, 'WebGL controls are alive…', 0.16, 'foundation-services-ready');
	const webGlBootFrame = paintEretzWebGlBootFrame(services, qualityProfile, environment);
	reportFoundationStage(options, 'First WebGL light is visible…', 0.24, 'foundation-first-clear');
	await nextLaunchFrame(environment);
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('essential-assets');
	reportFoundationStage(options, 'Preparing the local traveler…', 0.42, 'essential-local-assets');
	const loaded = await loadEretzEssentialAssets({
		...options,
		boot: options.boot,
		environment,
		quality: qualityProfile.quality
	});
	throwIfLaunchAborted(options.signal);
	options.boot?.begin('bootstrap-visible-world');
	reportFoundationStage(options, 'Opening the playable meadow…', 0.74, 'bootstrap-visible-world');
	const world = createBootstrapWorldFoundation(services);
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

/** Reports a fine-grained stage while naming the one generated artifact currently executing it. */
function reportFoundationStage(options, message, progress, stage) {
	reportLaunchProgress(options, message, progress, {
		stage,
		url: import.meta.url
	});
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
