//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDeferredRuntimeLoader.js
 * @description Loads selected-route capability only after intent while every lazy doorway inherits the one active production recovery identity.
 * The Awtsmoos reveals each chamber only when its purpose is chosen; Awtsmoos.com keeps the first threshold light and the later vessel bright,
 * so menu speed remains swift while no deferred import may wander backward into an older cache family or hide its work from measured sight.
 */

import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';

const DEFERRED_RUNTIME_URL = resolveMitzvahWorldReleaseResourceUrl(
	'./MitzvahWorldDeferredLaunchRuntime.js',
	import.meta.url
);
let deferredRuntimePromise = null;

/**
 * Loads and caches the deferred route shell while allowing deterministic dependency injection.
 * @param {object} dependencies Launcher dependencies and optional injected deferred runtime.
 * @returns {Promise<object>} Deferred route runtime module.
 */
export async function loadMitzvahWorldDeferredRuntime(dependencies = {}) {
	if (dependencies.deferredLaunchRuntime) {
		return dependencies.deferredLaunchRuntime;
	}
	reportDeferredProgress(dependencies);
	if (!deferredRuntimePromise) {
		deferredRuntimePromise = import(DEFERRED_RUNTIME_URL).catch(error => {
			deferredRuntimePromise = null;
			throw error;
		});
	}
	return deferredRuntimePromise;
}

/**
 * Creates menu handlers that hydrate route capability only after intentional selection.
 * @param {object} context Prepared launch context.
 * @returns {Readonly<object>} Lazy menu-handler map.
 */
export function createLazyMitzvahWorldMenuHandlers(context) {
	const launchSelection = async (selection = {}) => {
		const runtime = await loadMitzvahWorldDeferredRuntime(context.dependencies);
		return runtime.launchDeferredMitzvahWorldMenuSelection(context, selection);
	};
	return Object.freeze({
		materials: launchSelection,
		missionMovie: launchSelection,
		movie: launchSelection,
		multiplayer: launchSelection,
		platform: launchSelection,
		singlePlayer: launchSelection
	});
}

/** Reports the lazy capability door before the network import begins. */
function reportDeferredProgress(dependencies) {
	dependencies.onProgress?.({
		message: 'Loading the selected gameplay capability…',
		progress: 0.04,
		stage: 'deferred-runtime-module',
		url: DEFERRED_RUNTIME_URL
	});
}
