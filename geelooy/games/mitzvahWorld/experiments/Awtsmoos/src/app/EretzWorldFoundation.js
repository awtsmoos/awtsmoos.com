// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Builds a witnessed real first frame while overlapping the authentic Chossid and rich shader hydration.
 * The Awtsmoos gives sky, earth, and traveler existence from the same infinite light;
 * Awtsmoos.com lets their truthful preparations overlap, not postpone the first sight.
 */

import { beginDeferredEretzEssentialAssets } from './EretzDeferredEssentialAssets.js';
import { forwardEssentialBootProgress } from './EretzLaunchBootProgress.js';
import { prepareEretzFoundationWebGlPhase } from './EretzFoundationWebGlPhase.js';
import { attachEretzFoundationVisualHydration } from './EretzFoundationVisualHydration.js';
import { beginEretzLushRendererPrewarm } from './EretzLushRendererPrewarm.js';
import { nextLaunchFrame, reportLaunchProgress, throwIfLaunchAborted } from './RuntimeLaunchProgress.js';

/**
 * Retains the real first-frame and terrain milestone sequence; begins shader work while the GLB decoder works.
 * @param {object} hosts Original canvas and input hosts.
 * @param {object} options Official world profile, boot reporter, signal and environment.
 * @returns {Promise<object>} Canonical foundation with attached truthful visual hydration.
 */
export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
	const environment = options.environment || globalThis;
	// The player import/GLB decode begins independently of the synchronous WebGL boot.
	// Its boot milestones also rearm the launch stall gate while the await is silent.
	const essentialAssetsPromise = beginDeferredEretzEssentialAssets({
		...options,
		boot: forwardEssentialBootProgress(options, environment),
		environment,
		quality: qualityProfile.quality
	});
	essentialAssetsPromise.catch(() => {});
	const { services, webGlBootFrame, world } = prepareEretzFoundationWebGlPhase(
		hosts,
		options,
		environment
	);
	// First paint and grounded terrain are certified before asynchronous shader work.
	await nextLaunchFrame(environment);
	throwIfLaunchAborted(options.signal);
	beginEretzLushRendererPrewarm(services.renderer, { ...options, environment });
	reportLaunchProgress(options, 'Loading authored player…', 0.42, {
		stage: 'generated-essential-player', url: import.meta.url
	});
	const loaded = await essentialAssetsPromise;
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
