// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableActivation.js
 * @description Protects real first control before elected scenic post-play continuation.
 * The Awtsmoos brings the traveler to life before his meadows awaken;
 * Awtsmoos.com lets no optional forest replace the first honest step taken.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';
import { scheduleEretzPostPlayableContinuation } from './EretzPostPlayableScheduling.js';

const READABLE_SOURCE = 'EretzPostPlayableActivation.js';
const POST_CONTROL_URL = generated('mitzvah-world-post-control.compact.js');
const POST_PLAYABLE_URL = deferred('EretzPostPlayablePriority.js');
const VISUAL_SEQUENCE_URL = deferred('EretzVisualPromotionSequence.js');

/** Installs one idempotent continuation after strict playable publication. */
export function installEretzPostPlayableActivation(core, options, boot, environment) {
	let activated = false;
	core.diagnostics.activatePostPlayable = () => {
		if (activated) return core.diagnostics.postPlayablePriorityPromise || null;
		activated = true;
		boot.complete();
		startPostControlHydration(core, options, boot);
		const visuals = startVisualPromotion(core, options, boot, environment);
		startPostPlayable(core, options, boot, environment, visuals);
		return core.diagnostics.postPlayablePriorityPromise;
	};
	return core.diagnostics;
}

/** Hydrates richer controls without replacing already working movement. */
function startPostControlHydration(core, options, boot) {
	const diagnostics = core.diagnostics;
	diagnostics.postControlHydrationStage = 'loading-module';
	const promise = import(POST_CONTROL_URL)
		.then(module => {
			diagnostics.postControlHydrationStage = 'hydrating';
			return module.hydrateBootstrapPostControl(core, options, core.qualityProfile, boot);
		})
		.then(result => {
			diagnostics.postControlHydrationStage = 'ready';
			return result;
		})
		.catch(error => {
			diagnostics.postControlHydrationStage = 'degraded';
			diagnostics.postControlHydrationError = error;
			console.warn('[MitzvahWorld] Post-control hydration degraded.', error);
			return null;
		});
	diagnostics.postControlHydrationPromise = promise;
}

/** Starts original visual promotion independently, preserving its failure receipt. */
function startVisualPromotion(core, options, boot, environment) {
	const diagnostics = core.diagnostics;
	diagnostics.rendererPolicyStage = 'loading-sequence';
	const promise = import(VISUAL_SEQUENCE_URL)
		.then(module => module.startEretzVisualPromotionSequence(
			diagnostics, environment, boot, options, core.foundation
		))
		.then(result => {
			diagnostics.rendererPolicyStage = 'ready';
			return result;
		})
		.catch(error => {
			diagnostics.rendererPolicyStage = 'degraded';
			diagnostics.rendererPolicyError = error;
			return null;
		});
	diagnostics.rendererPolicyPromise = promise;
	return promise;
}

/** Only opt-in Lush Meadow skips visual completion, and only after a browser frame. */
function startPostPlayable(core, options, boot, environment, visualPromise) {
	const diagnostics = core.diagnostics;
	diagnostics.postPlayablePriorityStage = options.worldExperience?.cinematicBotany === true
		? 'waiting-for-first-frame' : 'waiting-for-required-visuals';
	const coordinator = scheduleEretzPostPlayableContinuation({
		environment,
		visualPromise,
		worldExperience: options.worldExperience,
		start: async () => {
			diagnostics.postPlayablePriorityStage = 'loading-module';
			const module = await import(POST_PLAYABLE_URL);
			return module.startEretzPostPlayablePriority({ boot, core, environment, options });
		}
	}).catch(error => degradePostPlayable(diagnostics, error));
	diagnostics.postPlayablePriorityPromise = coordinator;
	diagnostics.enrichmentPromise = coordinator.then(receipt => receipt?.districts ?? null);
	diagnostics.deferredEnrichmentPromise = coordinator.then(receipt => receipt?.enrichment ?? null);
}

/** Optional scenic failures cannot revoke the real first-control frame. */
function degradePostPlayable(diagnostics, error) {
	diagnostics.postPlayablePriorityError = error;
	diagnostics.postPlayablePriorityStage = 'degraded';
	console.warn('[MitzvahWorld] Post-play priority coordinator degraded.', error);
	return null;
}

function deferred(specifier) {
	return resolveDeferredAppModuleUrl(specifier, import.meta.url, READABLE_SOURCE);
}

function generated(fileName) {
	return resolveGeneratedRuntimeChunkUrl(fileName, import.meta.url, READABLE_SOURCE);
}
