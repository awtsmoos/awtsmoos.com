//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzWorldFoundation.js
 * @description Builds first play only after canonical humanity, rich WebGL, and real terrain texture truth are ready.
 * The initial WebGL clear may appear immediately, but `playable` is impossible until authored visual essentials succeed.
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
 * Creates foundation geometry immediately, then loads the real Chossid and essential visuals concurrently.
 * @returns {Promise<object>} Foundation visually canonical enough for honest first control.
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
	reportFoundationStage(options, 'Loading authored player and textures…', 0.42, 'essential-authored-assets');
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
			terrain: world.terrain
		})
	]);
	throwIfLaunchAborted(options.signal);
	markVisibleWorldReady(options);
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

function markVisibleWorldReady(options) {
	options.boot?.progress?.(
		'bootstrap-visible-world',
		1,
		1,
		'Canonical Chossid, rich WebGL, and authored terrain are ready.',
		'ready'
	);
}
