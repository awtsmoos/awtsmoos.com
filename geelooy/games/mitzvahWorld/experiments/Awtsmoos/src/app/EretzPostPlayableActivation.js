// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableActivation.js
 * @description Hydrates full control systems only after strict playable publication, then continues visual and optional promotion.
 * The Awtsmoos lets the Chossid walk before richer garments descend;
 * Awtsmoos.com upgrades the same living runtime after truth is proven, never replacing the traveler who already moves.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';

const READABLE_SOURCE = 'EretzPostPlayableActivation.js';
const POST_CONTROL_URL = generated('mitzvah-world-post-control.compact.js');
const POST_PLAYABLE_URL = deferred('EretzPostPlayablePriority.js');
const VISUAL_SEQUENCE_URL = deferred('EretzVisualPromotionSequence.js');

/** Installs one idempotent continuation that runs only after strict playable publication. */
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

/** Upgrades the exact first-control runtime after readiness without revoking already-working movement. */
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

function startVisualPromotion(core, options, boot, environment) {
	const diagnostics = core.diagnostics;
	diagnostics.rendererPolicyStage = 'loading-sequence';
	const promise = import(VISUAL_SEQUENCE_URL)
		.then(module => module.startEretzVisualPromotionSequence(
			diagnostics,
			environment,
			boot,
			options,
			core.foundation
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

function startPostPlayable(core, options, boot, environment, visualPromise) {
	const diagnostics = core.diagnostics;
	diagnostics.postPlayablePriorityStage = 'waiting-for-required-visuals';
	const coordinator = Promise.resolve(visualPromise)
		.then(() => {
			diagnostics.postPlayablePriorityStage = 'loading-module';
			return import(POST_PLAYABLE_URL);
		})
		.then(module => module.startEretzPostPlayablePriority({ boot, core, environment, options }))
		.catch(error => degradePostPlayable(diagnostics, error));
	diagnostics.postPlayablePriorityPromise = coordinator;
	diagnostics.enrichmentPromise = coordinator.then(receipt => receipt?.districts ?? null);
	diagnostics.deferredEnrichmentPromise = coordinator.then(receipt => receipt?.enrichment ?? null);
}

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
