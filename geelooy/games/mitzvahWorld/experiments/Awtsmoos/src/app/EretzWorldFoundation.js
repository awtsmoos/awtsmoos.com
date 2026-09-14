//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Builds first play from canonical humanity, WebGL, and bootstrap terrain while allowing only Blank Meadow to defer remote terrain texture richness.
 * The Awtsmoos gives the true traveler and visible earth before distant garments crowd the threshold;
 * Awtsmoos.com keeps rich worlds strict, yet lets the reliability meadow become honestly controllable before decorative texture streams consume the road.
 */

import { createBootstrapWorldFoundation } from './BootstrapWorldFoundation.js';
import { loadEretzEssentialAssets } from './EretzEssentialAssetLoader.js';
import { prepareEretzEssentialVisuals } from './EretzEssentialVisualGate.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js';
import { paintEretzWebGlBootFrame } from './EretzWebGlBootFrame.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';
import {
	nextLaunchFrame,
	reportLaunchProgress,
	throwIfLaunchAborted
} from './RuntimeLaunchProgress.js';

/**
 * Creates foundation geometry immediately, then loads the real Chossid and policy-approved essential visuals concurrently.
 * @returns {Promise<object>} Foundation honest enough for first control under the selected immutable world policy.
 */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	options.boot?.begin('webgl-context');
	reportFoundationStage(options, 'Opening WebGL…', 0.08, 'foundation-renderer-services');
	const services = createEretzFoundationServices(hosts, qualityProfile, environment);
	const webGlBootFrame = paintEretzWebGlBootFrame(services, qualityProfile, environment);
	await nextLaunchFrame(environment);
	markMitzvahWorldStartupMilestone(environment, 'rendererReady');
	throwIfLaunchAborted(options.signal);

	options.boot?.begin('bootstrap-visible-world');
	const world = createBootstrapWorldFoundation(services);
	reportFoundationStage(options, 'Loading authored player and essential visuals…', 0.42, 'essential-authored-assets');
	const [loaded, visualEvidence] = await Promise.all([
		loadEretzEssentialAssets({
			...options,
			boot: options.boot,
			environment,
			quality: qualityProfile.quality
		}),
		prepareEretzEssentialVisuals({
			boot: options.boot,
			renderer: services.renderer,
			signal: options.signal,
			terrain: world.terrain,
			worldExperience: options.worldExperience
		})
	]);
	throwIfLaunchAborted(options.signal);
	markVisibleWorldReady(options, visualEvidence);
	return {
		hosts,
		...hosts,
		...loaded,
		...services,
		...world,
		environment,
		essentialVisualEvidence: visualEvidence,
		qualityProfile,
		webGlBootFrame
	};
}

/** Reports one exact foundation stage for launch diagnostics. */
function reportFoundationStage(options, message, progress, stage) {
	reportLaunchProgress(options, message, progress, {
		stage,
		url: import.meta.url
	});
}

function markVisibleWorldReady(options, visualEvidence) {
	const deferredTerrain = visualEvidence?.terrainPhase === 'deferred-by-world-profile';
	options.boot?.progress?.(
		'bootstrap-visible-world',
		1,
		1,
		deferredTerrain
			? 'Canonical Chossid, WebGL, and bootstrap terrain are ready; authored textures are deferred.'
			: 'Canonical Chossid, rich WebGL, and authored terrain are ready.',
		'ready'
	);
}
