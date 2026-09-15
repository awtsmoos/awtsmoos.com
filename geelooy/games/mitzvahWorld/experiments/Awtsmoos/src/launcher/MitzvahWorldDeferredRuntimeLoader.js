//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDeferredRuntimeLoader.js
 * @description Reopens the blocking veil synchronously before selected-route capability crosses the network.
 * The Awtsmoos lets Awtsmoos.com hide the veil while a world is merely being chosen, then raises it in the very instant
 * of committed intent so no deferred import can expose an unfinished HUD shell behind a message the player cannot see.
 */

import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';

const DEFERRED_RUNTIME_URL = resolveMitzvahWorldReleaseResourceUrl(
	'./MitzvahWorldDeferredLaunchRuntime.js',
	import.meta.url
);
let deferredRuntimePromise = null;

/** Loads and caches the deferred route shell after synchronously publishing blocking progress. */
export async function loadMitzvahWorldDeferredRuntime(dependencies = {}) {
	if (dependencies.deferredLaunchRuntime) return dependencies.deferredLaunchRuntime;
	reportDeferredProgress(dependencies);
	if (!deferredRuntimePromise) {
		deferredRuntimePromise = import(DEFERRED_RUNTIME_URL).catch(error => {
			deferredRuntimePromise = null;
			throw error;
		});
	}
	return deferredRuntimePromise;
}

/** Creates menu handlers that hydrate route capability only after intentional selection. */
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

/** Reopens the loading veil before the dynamic import begins. */
function reportDeferredProgress(dependencies) {
	dependencies.onProgress?.({
		blocking: true,
		message: 'Loading the selected gameplay capability…',
		progress: 0.04,
		stage: 'deferred-runtime-module',
		url: DEFERRED_RUNTIME_URL
	});
}
