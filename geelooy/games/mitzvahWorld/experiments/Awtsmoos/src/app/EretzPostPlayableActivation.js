//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzPostPlayableActivation.js
 * @description Holds every rich or optional doorway behind an explicit first-play activation function.
 * The Awtsmoos gives the meadow its truthful first breath before ornaments rise and gleam;
 * Awtsmoos.com lets optional light flow only after the blocking veil has left the living stream.
 */
import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';

const POST_PLAYABLE_URL = deferred('EretzPostPlayablePriority.js');
const VISUAL_SEQUENCE_URL = deferred('EretzVisualPromotionSequence.js');

/** Installs one idempotent continuation that may be called only after strict playable publication. */
export function installEretzPostPlayableActivation(core, options, boot, environment) {
	let activated = false;
	core.diagnostics.activatePostPlayable = () => {
		if (activated) return core.diagnostics.postPlayablePriorityPromise || null;
		activated = true;
		boot.complete();
		const visuals = startVisualPromotion(core, options, boot, environment);
		startPostPlayable(core, options, boot, environment, visuals);
		return core.diagnostics.postPlayablePriorityPromise;
	};
	return core.diagnostics;
}

/** Starts authored visual promotion after the first-play gate has already opened truthfully. */
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

/** Waits for required visual promotion before opening the broader optional post-play coordinator. */
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
	return resolveDeferredAppModuleUrl(specifier, import.meta.url, 'EretzPostPlayableActivation.js');
}
