//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file createEretzRuntime.js
 * @description Publishes gameplay only after staged canonical essentials complete, then starts nonessential enrichment without blocking control.
 * Renderer policy has its own promise identity so it can never masquerade as the renderer's actual hydration promise.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import {
	markRuntimeFailed,
	markRuntimePlayable,
	markRuntimeStarting
} from './RuntimeStateMarker.js';

const TRACKER_URL = deferred('BootPhaseTracker.js?v=20260722-boot-text-01');
const STAGED_RUNTIME_URL = deferred('EretzStagedRuntime.js?v=20260908-current-hot-path-03');
const RENDERER_POLICY_URL = deferred('EretzRendererWorldPolicy.js?v=20260910-canonical-visuals-01');
const POST_PLAYABLE_URL = deferred('EretzPostPlayablePriority.js?v=20260908-current-hot-path-03');

/** Creates canonical first play, publishes it, then starts optional world aftercare. */
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
		startRendererPolicyAfterPlay(core.diagnostics, environment, boot, options);
		startPostPlayableStreams(core, options, boot, environment);
		return core.diagnostics;
	} catch (error) {
		boot.fail(error);
		exposeBootFailure(error, hosts, environment);
		throw error;
	} finally {
		if (globalThis.AwtsmoosBootTracker === boot) globalThis.AwtsmoosBootTracker = null;
	}
}
function startRendererPolicyAfterPlay(diagnostics, environment, boot, options) {
	diagnostics.rendererPolicyStage = 'loading-policy';
	const policyPromise = import(RENDERER_POLICY_URL)
		.then(module => module.startEretzRendererByWorldPolicy(
			diagnostics,
			environment,
			boot,
			options
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
