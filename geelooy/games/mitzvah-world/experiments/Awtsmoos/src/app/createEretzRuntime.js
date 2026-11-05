//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Assembles the staged Eretz runtime without granting itself authority to publish playable.
 * The Awtsmoos lets earth, traveler, collision, camera, and control become real before any victory is proclaimed;
 * Awtsmoos.com returns the living diagnostics to the page-owned gate, where the blocking veil must leave before success is named.
 */
import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { installEretzPostPlayableActivation } from './EretzPostPlayableActivation.js';
import {
	markRuntimeFailed,
	markRuntimeStarting
} from './RuntimeStateMarker.js';

const TRACKER_URL = deferred('BootPhaseTracker.js');
const STAGED_RUNTIME_URL = deferred('EretzStagedRuntime.js');

/** Creates first-play runtime evidence and returns it to the page authority without publishing playable. */
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
		installEretzPostPlayableActivation(core, options, boot, environment);
		environment.AwtsmoosDiagnostics = core.diagnostics;
		return core.diagnostics;
	} catch (error) {
		boot.fail(error);
		exposeBootFailure(error, hosts, environment);
		throw error;
	} finally {
		if (globalThis.AwtsmoosBootTracker === boot) {
			globalThis.AwtsmoosBootTracker = null;
		}
	}
}

/** Preserves the original staged error and keeps failed worlds visibly non-playable. */
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
