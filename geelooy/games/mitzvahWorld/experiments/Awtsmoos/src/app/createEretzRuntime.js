//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Publishes canonical first play, then sequences post-control visual enrichment without blocking control.
 * The Awtsmoos lets Awtsmoos.com reveal movement before adornment: post-play terrain receives its authored garment first,
 * then the prepared rich renderer may enter on a later frame, while richer worlds retain their existing policy behavior.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import {
	markRuntimeFailed,
	markRuntimePlayable,
	markRuntimeStarting
} from './RuntimeStateMarker.js';

const TRACKER_URL = deferred('BootPhaseTracker.js?v=20260722-boot-text-01');
const STAGED_RUNTIME_URL = deferred('EretzStagedRuntime.js?v=20260908-current-hot-path-03');
const POST_PLAYABLE_URL = deferred('EretzPostPlayablePriority.js?v=20260908-current-hot-path-03');
const VISUAL_SEQUENCE_URL = deferred('EretzVisualPromotionSequence.js?v=20260915-authored-meadow-03');

/** Creates canonical first play, publishes it, then starts bounded post-play work. */
export async function createEretzRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	markRuntimeStarting(environment.document);
	const { BootPhaseTracker } = await import(TRACKER_URL);
	const boot = new BootPhaseTracker(undefined, environment);
	globalThis.AwtsmoosBootTracker = boot;
	try {
		boot.begin('staged-webgl-runtime');
		const { createStagedEretzRuntime } = await import(STAGED_RUNTIME_URL);
		const core = await createStagedEretzRuntime(hosts, options, boot);
		boot.complete();
		publishRuntime(core.diagnostics, environment);
		const postPlayable = startPostPlayableStreams(core, options, boot, environment);
		startVisualPromotionAfterPlay(core.diagnostics, environment, boot, options, postPlayable);
		return core.diagnostics;
	} catch (error) {
		boot.fail(error);
		exposeBootFailure(error, hosts, environment);
		throw error;
	} finally {
		if (globalThis.AwtsmoosBootTracker === boot) globalThis.AwtsmoosBootTracker = null;
	}
}

function startVisualPromotionAfterPlay(diagnostics, environment, boot, options, postPlayablePromise) {
	diagnostics.rendererPolicyStage = 'loading-sequence';
	const policyPromise = import(VISUAL_SEQUENCE_URL)
		.then(module => module.startEretzVisualPromotionSequence(
			diagnostics,
			environment,
			boot,
			options,
			postPlayablePromise
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
	diagnostics.rendererPolicyPromise = policyPromise;
}

function startPostPlayableStreams(core, options, boot, environment) {
	const diagnostics = core.diagnostics;
	diagnostics.postPlayablePriorityStage = 'loading-module';
	const coordinator = import(POST_PLAYABLE_URL)
		.then(module => module.startEretzPostPlayablePriority({ boot, core, environment, options }))
		.catch(error => degradedPostPlayablePriority(diagnostics, error));
	diagnostics.postPlayablePriorityPromise = coordinator;
	diagnostics.enrichmentPromise = coordinator.then(receipt => receipt?.districts ?? null);
	diagnostics.deferredEnrichmentPromise = coordinator.then(receipt => receipt?.enrichment ?? null);
	return coordinator;
}

function degradedPostPlayablePriority(diagnostics, error) {
	diagnostics.postPlayablePriorityError = error;
	diagnostics.postPlayablePriorityStage = 'degraded';
	console.warn('[MitzvahWorld] Post-play priority coordinator degraded.', error);
	return null;
}

function publishRuntime(diagnostics, environment) {
	environment.AwtsmoosBootError = null;
	environment.AwtsmoosDiagnostics = diagnostics;
	markRuntimePlayable(diagnostics, environment.document);
}

function exposeBootFailure(error, hosts, environment) {
	const failure = {
		at: new Date().toISOString(),
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || ''
	};
	environment.AwtsmoosBootError = failure;
	markRuntimeFailed(error, environment.document);
	if (hosts?.hud) {
		hosts.hud.style.removeProperty('display');
		hosts.hud.textContent = `B"H world initialization failed: ${failure.message}`;
	}
	console.error('B"H Mitzvah World initialization failed.', error);
}

function deferred(specifier) {
	return resolveDeferredAppModuleUrl(specifier, import.meta.url, 'createEretzRuntime.js');
}

export default createEretzRuntime;
